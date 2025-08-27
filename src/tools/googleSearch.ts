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
import { googleSearchResponseSchema } from "../schemas";
import {
  googleSearchSystemPromptTemplate,
  googleSearchResultsTemplate,
} from "../templates";
import { openai } from "../consts";

const customsearch = google.customsearch("v1");

const turndownService = new TurndownService();

const chromaClient = new ChromaClient();

const TEMP_COLLECTION = "TEMP_COLLECTION";
const CHUNK_SIZE = 1024;
const CHUNK_OVERLAP = 128;

async function main() {
  const query = await input({ message: "Search Google:" });

  const searchResults = await getGoogleSearchResults(query);

  const collection = await createChromaCollection();

  for (const result of searchResults) {
    try {
      const pageContent = await getPageContent(result.link);
      await populateCollection({ ...pageContent, collection });
    } catch (err) {
      if (err instanceof Error) {
        console.warn(err.message);
      }
      continue;
    }
  }

  const report = await queryCollection({ question: query, collection });

  await evaluateSearchReport({ query, report });

  await removeChromaCollection();

  // for (const result of searchResults) {
  //   try {
  //     const pageContent = await getPageContent(result.link);

  //     // const searchEval = await evaluateSearchResult({ query, ...pageContent });

  //     // if (searchEval?.status === "done") {
  //     //   console.log(searchEval);
  //     //   return;
  //     // }
  //   } catch (err) {
  //     if (err instanceof Error) {
  //       console.warn(err.message);
  //     }
  //     continue;
  //   }
  // }
}

const getGoogleSearchResults = async (query: string) => {
  const response = await customsearch.cse.list({
    cx: config.googleCustomSearchId,
    q: query,
    auth: config.googleApiKey,
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

    // return searchResultMessageParsed;

    console.log(searchResultMessageParsed);
  } catch {
    console.warn("Failed to parse LLM response");
  }
};

const createChromaCollection = async () => {
  return await chromaClient.createCollection({
    name: TEMP_COLLECTION,
  });
};

const removeChromaCollection = async () => {
  await chromaClient.deleteCollection({ name: TEMP_COLLECTION });
};

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
    // nResults: 5,
  });

  const rows = queryResult.rows();

  const rowsString = googleSearchResultsTemplate({
    results: rows[0].map((row, index) => ({
      index,
      content: row.document ?? "",
      title: row.metadata?.title?.toString() ?? "",
      url: row.metadata?.url?.toString() ?? "",
    })),
  });

  return rowsString;
};

main().catch((err) => {
  console.error(err);
  removeChromaCollection();
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
