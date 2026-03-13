import { execFileSync } from "node:child_process";

import z from "zod";

import { StandaloneTool } from "./StandaloneTool";

export const ls = new StandaloneTool<{ path: string }>({
  name: "ls",
  description: "List files in a directory. Wrapper for the 'ls -hal' command.",
  zodSchema: z.object({
    path: z.string().describe("Path to target directory"),
  }),
  toolFunction: ({ path }) => {
    return execFileSync("ls", ["-hal", path], { encoding: "utf-8" });
  },
});
