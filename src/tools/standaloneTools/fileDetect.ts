import { execFileSync } from "node:child_process";

import z from "zod";

import { StandaloneTool } from "./StandaloneTool";

export const fileDetect = new StandaloneTool({
  name: "fileDetect",
  description: "Get the type of file. Wrapper for the 'file' command.",
  zodSchema: z.object({
    path: z.string().describe("Path to the target file"),
  }),
  toolFunction: ({ path }) => {
    return execFileSync("file", ["-hal", path], { encoding: "utf-8" });
  },
});
