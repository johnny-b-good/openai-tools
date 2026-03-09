import { execSync } from "node:child_process";
import { writeFileSync, rmSync } from "node:fs";

import z from "zod";

import { type ToolDescription } from "../types";

export const runJavaScript: ToolDescription<{ source: string }> = {
  name: "runJavaScript",
  description:
    "Execute JavaScript code with NodeJS. The program must output with console.log() method. You must annotate your code with comments.",
  zodSchema: z.object({
    source: z.string().describe("JavaScript source code"),
  }),
  toolFunction: ({ source }) => {
    writeFileSync("temp.js", source, "utf-8");
    const result = execSync(`node temp.js`, { encoding: "utf-8" });
    rmSync("temp.js");
    return result;
  },
};
