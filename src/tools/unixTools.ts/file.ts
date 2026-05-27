import z from "zod";

import { UnixTool } from "./UnixTool";

export const file = new UnixTool({
  name: "file",
  description: "Detect a file's type with the 'file' command.",
  zodSchema: z.object({
    path: z.string().describe("Path to target file"),
  }),
  command: "file",
  getCommandArgs: ({ path }) => [path],
});
