import { google } from "googleapis";
import { Readability } from "@mozilla/readability";
import { JSDOM, VirtualConsole } from "jsdom";
import { input } from "@inquirer/prompts";
import TurndownService from "turndown";
import OpenAI from "openai";
import z from "zod/v4";

import { config } from "../utils";
import { googleSearchResponseSchema } from "../schemas";
import {
  googleSearchSystemPromptTemplate,
  googleSearchResultMessageTemplate,
} from "../templates";
import { openai } from "../consts";

const customsearch = google.customsearch("v1");
const turndownService = new TurndownService();

async function main() {
  const query = await input({ message: "Search Google:" });

  const searchResults = await getGoogleSearchResults(query);

  for (const result of searchResults) {
    try {
      const pageContent = await getPageContent(result.link);

      const searchEval = await evaluateSearchResult({ query, ...pageContent });

      if (searchEval?.status === "done") {
        console.log(searchEval);
        return;
      }
    } catch (err) {
      if (err instanceof Error) {
        console.warn(err.message);
      }
      continue;
    }
  }
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
    console.log("Page loaded");
    const pageText = await pageResponse.text();
    console.log("Got text");
    const doc = new JSDOM(pageText, { url, virtualConsole });
    console.log("Got document");
    const reader = new Readability(doc.window.document);
    console.log("Got reader");
    const article = reader.parse();
    console.log("Got article");

    const markdown =
      article?.content && turndownService.turndown(article?.content);

    if (!article?.title || !markdown) {
      throw new Error("Missing title or content");
    }

    return { title: article.title, content: markdown, url };
  } catch {
    throw new Error("Failed to parse search result");
  }
};

const evaluateSearchResult = async ({
  query,
  title,
  url,
  content,
}: {
  query: string;
  title: string;
  url: string;
  content: string;
}) => {
  console.log(`Evaluating "${title}" at ${url}`);

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
      content: googleSearchResultMessageTemplate({
        title,
        url,
        content,
      }),
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
    console.warn("Failed to parse LLM response");
  }
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
