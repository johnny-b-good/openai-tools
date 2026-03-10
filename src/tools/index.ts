import type OpenAI from "openai";
import z from "zod";

import { datetime } from "./datetime";
import { ls } from "./ls";
import { getHomeDir } from "./getHomeDir";
import { fileDetect } from "./fileDetect";
import { runJavaScript } from "./runJavaScript";
import type { ToolDescription, ToolArgs } from "../types";

export const allTools = [datetime, ls, getHomeDir, fileDetect, runJavaScript];

export const runToolByName = async (toolName: string, toolArgs: string) => {
  const tool = allTools.find((tool) => tool.name === toolName);

  if (!tool) {
    throw new Error(`Unknown tool name: ${toolName}`);
  }

  let args;
  try {
    args = JSON.parse(toolArgs);
  } catch {
    throw new Error("Malformed tool arguments");
  }

  const { zodSchema, toolFunction } = tool;

  if (zodSchema && zodSchema.safeParse(args).error) {
    throw new Error("Bad tool arguments");
  }

  return await toolFunction(args);
};

export const makeToolSchema = <T extends ToolArgs>(
  tool: ToolDescription<T>,
): OpenAI.Chat.Completions.ChatCompletionFunctionTool => ({
  type: "function",
  function: {
    name: tool.name,
    description: tool.description,
    parameters: tool.zodSchema
      ? z.toJSONSchema(tool.zodSchema)
      : {
          type: "object",
          properties: {},
          required: [],
        },
  },
});

export const allToolSchemas = allTools.map((tool) =>
  makeToolSchema(tool as ToolDescription),
);
