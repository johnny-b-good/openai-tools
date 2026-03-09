import { execSync } from "node:child_process";

import z from "zod";

import { type ToolDescription } from "../types";

export const fileDetect: ToolDescription<{ path: string }> = {
  name: "fileDetect",
  description: "Get type of file. Wrapper for the 'file' command.",
  zodSchema: z.object({
    path: z.string().describe("Path to target file"),
  }),
  toolFunction: ({ path }) => {
    return execSync(`file ${path}`, { encoding: "utf-8" });
  },
};
