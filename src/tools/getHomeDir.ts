import * as z from "zod/v4";

import { type ToolDescription } from "../types";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type Input = {};
type Output = string;

export const getHomeDir: ToolDescription<Input, Output> = {
  name: "getHomeDir",
  schema: {
    type: "function",
    function: {
      name: "getHomeDir",
      description: "Get the user's home directory path",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  function: () => {
    return process.env.HOME || process.env.USERPROFILE || "/";
  },
  checkArgs: (args): args is Input => {
    const argsSchema = z.object({});
    return argsSchema.safeParse(args).success;
  },
};
