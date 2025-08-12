import { execSync } from "node:child_process";
import { type ToolDescription } from "../types";
import * as z from "zod/v4";

type Input = { path: string };
type Output = string;

export const fileDetect: ToolDescription<Input, Output> = {
  name: "fileDetect",
  schema: {
    name: "fileDetect",
    description: "Get type of file. Wrapper for the 'file' command.",
    type: "function",
    parameters: {
      type: "object",
      required: ["path"],
      properties: {
        path: { type: "string", description: "Path to target file" },
      },
    },
    strict: true,
  },
  function: ({ path }) => {
    return execSync(`file ${path}`, { encoding: "utf-8" });
  },
  checkArgs: (args): args is Input => {
    const argsSchema = z.object({
      path: z.string(),
    });
    return argsSchema.safeParse(args).success;
  },
};
