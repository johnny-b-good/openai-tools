import { execSync } from "node:child_process";
import { writeFileSync, rmSync } from "node:fs";

import * as z from "zod/v4";

import { type ToolDescription } from "../types";

type Input = { source: string };
type Output = string;

export const runJavaScript: ToolDescription<Input, Output> = {
  name: "runJavaScript",
  schema: {
    type: "function",
    function: {
      name: "runJavaScript",
      description:
        "Execute JavaScript code with NodeJS. The program must output with console.log() method. You must annotate your code with comments.",
      parameters: {
        type: "object",
        required: ["source"],
        properties: {
          source: {
            type: "string",
            description: "JavaScript source code",
          },
        },
      },
    },
  },
  function: ({ source }) => {
    writeFileSync("temp.js", source, "utf-8");
    const result = execSync(`node temp.js`, { encoding: "utf-8" });
    rmSync("temp.js");
    return result;
  },
  checkArgs: (args): args is Input => {
    const argsSchema = z.object({
      source: z.string(),
    });
    return argsSchema.safeParse(args).success;
  },
};
