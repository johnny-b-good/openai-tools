import z from "zod";

import { UnixTool } from "./UnixTool";

export const ls = new UnixTool({
  name: "ls",
  description:
    "List files in a directory with the 'ls' command and classify them by type (file, directory, etc).",
  zodSchema: z.object({
    path: z.string().describe("Path to target directory"),
  }),
  command: "ls",
  getCommandArgs: ({ path }) => ["-F", path],
});
