import { execSync } from "node:child_process";

import * as z from "zod/v4";

import { type ToolDescription } from "../types";

type Input = { path: string };
type Output = string;

export const ls: ToolDescription<Input, Output> = {
  name: "ls",
  schema: {
    type: "function",
    function: {
      name: "ls",
      description:
        "List files in a directory. Wrapper for the 'ls -hal' command.",
      parameters: {
        type: "object",
        required: ["path"],
        properties: {
          path: { type: "string", description: "Path to target directory" },
        },
      },
    },
  },
  function: ({ path }) => {
    return execSync(`ls -hal ${path}`, { encoding: "utf-8" });
  },
  checkArgs: (args): args is Input => {
    const argsSchema = z.object({
      path: z.string(),
    });
    return argsSchema.safeParse(args).success;
  },
};
