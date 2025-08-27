import { google } from "googleapis";
import { Readability } from "@mozilla/readability";
import { JSDOM, VirtualConsole } from "jsdom";
import { input } from "@inquirer/prompts";
import TurndownService from "turndown";
import OpenAI from "openai";
import z from "zod/v4";
import prettier from "prettier";
import {
  ChromaClient,
  type Collection as ChromaCollection,
  type Metadata as ChromaMetadata,
} from "chromadb";
import { v4 as uuidv4 } from "uuid";

import { config, chunkText } from "../utils";
import {
  googleSearchResponseSchema,
  pageSummaryResponseSchema,
} from "../schemas";
import {
  googleSearchSystemPromptTemplate,
  googleSearchResultsTemplate,
  googleSearchSummaryPromptTemplate,
} from "../templates";
import { openai } from "../consts";

const customsearch = google.customsearch("v1");

const turndownService = new TurndownService();

const chromaClient = new ChromaClient();

const TEMP_COLLECTION = "TEMP_COLLECTION";
const CHUNK_SIZE = 1024;
const CHUNK_OVERLAP = 128;
const GOOGLE_SEARCH_RESULTS_NUM = 10;
const CHROMA_SEARCH_RESULTS_NUM = 20;

async function main() {
  const query = await input({ message: "Search Google:" });

  const googleResults = await getGoogleSearchResults(query);

  // const collection = await createChromaCollection();

  // TODO: предварительное ранжирование источников!

  for (const result of googleResults) {
    try {
      const pageContent = await getPageContent(result.link);
      // console.log(pageContent.url);
      // console.log(pageContent.title);
      // console.log(pageContent.content);
      // await populateCollection({ ...pageContent, collection });
      const summary = await summarizePageContent(pageContent.content, query);
      console.log(summary);
    } catch (err) {
      if (err instanceof Error) {
        console.warn(err.message);
      } else {
        console.warn("Unknown error");
      }
      continue;
    }
  }

  // const collectionResults = await queryCollection({
  //   question: query,
  //   collection,
  // });

  // const uniqueUrls = new Set(collectionResults.map((res) => res.url));

  // const report = googleSearchResultsTemplate({ results: collectionResults });

  // const finalAnswer = await evaluateSearchReport({ query, report });

  // console.log({ ...finalAnswer, uniqueUrls });

  // await removeChromaCollection();
}

const getGoogleSearchResults = async (query: string) => {
  const response = await customsearch.cse.list({
    cx: config.googleCustomSearchId,
    q: query,
    auth: config.googleApiKey,
    num: GOOGLE_SEARCH_RESULTS_NUM,
  });

  if (!response.data.items) {
    throw new Error("Empty search result");
  }

  return response.data.items;
};

const getPageContent = async (url?: string | null) => {
  console.log(`Loading url: ${url}`);

  if (!url) {
    throw new Error("Missing URL");
  }

  let pageResponse: Response;
  try {
    pageResponse = await fetch(url);
  } catch {
    throw new Error("Failed to load page");
  }

  if (!pageResponse.ok) {
    throw new Error("Failed to load page");
  }

  const virtualConsole = new VirtualConsole();
  virtualConsole.removeAllListeners();

  try {
    const pageText = await pageResponse.text();
    const doc = new JSDOM(pageText, { url, virtualConsole });
    const reader = new Readability(doc.window.document);
    const article = reader.parse();

    const markdown =
      article?.content && turndownService.turndown(article?.content);

    if (!article?.title || !markdown) {
      throw new Error("Missing title or content");
    }

    const prettyMarkdown = await prettier.format(markdown, {
      parser: "markdown",
    });

    return { title: article.title, content: prettyMarkdown, url };
  } catch {
    throw new Error("Failed to parse search result");
  }
};

const summarizePageContent = async (text: string, query: string) => {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: googleSearchSummaryPromptTemplate({
        question: query,
      }),
    },
    {
      role: "user",
      content: text,
    },
  ];

  const summaryResponse = await openai.chat.completions.create({
    model: config.openaiModel,
    messages,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "response",
        schema: z.toJSONSchema(pageSummaryResponseSchema),
      },
    },
  });

  const summaryMessage = summaryResponse.choices[0].message;

  if (!summaryMessage.content) {
    throw new Error("Empty LLM message");
  }

  try {
    const summaryMessageJson = JSON.parse(summaryMessage.content);

    const summaryMessageParsed =
      pageSummaryResponseSchema.parse(summaryMessageJson);

    return summaryMessageParsed;
  } catch {
    throw new Error("Failed to parse LLM response");
  }
};

const evaluateSearchReport = async ({
  query,
  report,
}: {
  query: string;
  report: string;
}) => {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: googleSearchSystemPromptTemplate({
        question: query,
        query,
      }),
    },
    {
      role: "user",
      content: report,
    },
  ];

  const searchResultResponse = await openai.chat.completions.create({
    model: config.openaiModel,
    messages,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "response",
        schema: z.toJSONSchema(googleSearchResponseSchema),
      },
    },
  });

  const searchResultMessage = searchResultResponse.choices[0].message;

  if (!searchResultMessage.content) {
    throw new Error("Empty LLM message");
  }

  try {
    const searchResultMessageJson = JSON.parse(searchResultMessage.content);

    const searchResultMessageParsed = googleSearchResponseSchema.parse(
      searchResultMessageJson,
    );

    return searchResultMessageParsed;
  } catch {
    throw new Error("Failed to parse LLM response");
  }
};

const createChromaCollection = async () => {
  return await chromaClient.getOrCreateCollection({
    name: TEMP_COLLECTION,
  });
};

const removeChromaCollection = async () => {
  await chromaClient.deleteCollection({ name: TEMP_COLLECTION });
};

// TODO: Cache search results
const populateCollection = async ({
  title,
  content,
  url,
  collection,
}: {
  title: string;
  content: string;
  url: string;
  collection: ChromaCollection;
}) => {
  const pageId = uuidv4();

  const pageData: {
    ids: string[];
    embeddings: number[][];
    metadatas: ChromaMetadata[];
    documents: string[];
  } = {
    ids: [],
    embeddings: [],
    metadatas: [],
    documents: [],
  };

  const chunks = chunkText(content, {
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });

  for (const chunk of chunks) {
    pageData.ids.push(uuidv4());
    pageData.metadatas.push({
      title,
      url,
      pageId,
    });
    pageData.documents.push(chunk);
  }

  const embeddingsResponse = await openai.embeddings.create({
    input: chunks,
    model: config.openaiEmbeddingModel,
  });

  pageData.embeddings = embeddingsResponse.data.map((item) => item.embedding);

  await collection.add(pageData);
};

const queryCollection = async ({
  question,
  collection,
}: {
  question: string;
  collection: ChromaCollection;
}) => {
  const embeddingsResponse = await openai.embeddings.create({
    input: question,
    model: config.openaiEmbeddingModel,
  });

  const embeddings = embeddingsResponse.data.map((item) => item.embedding);

  const queryResult = await collection.query({
    queryEmbeddings: embeddings,
    nResults: CHROMA_SEARCH_RESULTS_NUM,
  });

  const rows = queryResult.rows();

  return rows[0].map((row, index) => ({
    index,
    content: row.document ?? "<EMPTY>",
    title: row.metadata?.title?.toString() ?? "<EMPTY>",
    url: row.metadata?.url?.toString() ?? "<EMPTY>",
  }));
};

main().catch((err) => {
  console.error(err);
});

// import * as z from "zod/v4";

// import { type ToolDescription } from "../types";

// type Input = {
//   query: string;
// };
// type Output = string;

// export const googleSearch: ToolDescription<Input, Output> = {
//   name: "googleSearch",
//   schema: {
//     type: "function",
//     function: {
//       name: "googleSearch",
//       description: "Search information with Google",
//       parameters: {
//         type: "object",
//         properties: {},
//       },
//     },
//   },
//   function: () => {
//     return process.env.HOME || process.env.USERPROFILE || "/";
//   },
//   checkArgs: (args): args is Input => {
//     const argsSchema = z.object({
//       query: z.string(),
//     });
//     return argsSchema.safeParse(args).success;
//   },
// };
