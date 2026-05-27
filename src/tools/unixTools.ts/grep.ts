import z from "zod";

import { UnixTool } from "./UnixTool";

export const grep = new UnixTool({
  name: "grep",
  description: "Search file contents with the 'grep' command.",
  zodSchema: z.object({
    pattern: z.string().describe("Pattern to search."),
    path: z.string().describe("Target path."),
    ignoreCase: z
      .boolean()
      .optional()
      .default(true)
      .describe("Is search case insensitive."),
  }),
  command: "grep",
  getCommandArgs: ({ pattern, path, ignoreCase = false }) => {
    const args: Array<string> = [];

    if (ignoreCase) {
      args.push("-i");
    }

    args.push(pattern, path);

    return args;
  },
});
