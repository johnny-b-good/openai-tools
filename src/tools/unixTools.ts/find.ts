import z from "zod";

import { UnixTool } from "./UnixTool";

export const find = new UnixTool({
  name: "find",
  description:
    "Find files and directories with the 'find' command by name pattern.",
  zodSchema: z.object({
    pattern: z.string().describe("Pattern to search."),
  }),
  command: "find",
  getCommandArgs: ({ pattern }) => [".", "-name", pattern],
});
