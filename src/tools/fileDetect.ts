import { execFileSync } from "node:child_process";

import z from "zod";

import { type ToolDescription } from "../types";

export const fileDetect: ToolDescription<{ path: string }> = {
  name: "fileDetect",
  description: "Get the type of file. Wrapper for the 'file' command.",
  zodSchema: z.object({
    path: z.string().describe("Path to the target file"),
  }),
  toolFunction: ({ path }) => {
    return execFileSync("file", ["-hal", path], { encoding: "utf-8" });
  },
};
