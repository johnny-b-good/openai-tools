import * as z from "zod/v4";

import { type ToolDescription } from "../types";

type Input = { source: string };
type Output = string;

export const javascriptInterpreter: ToolDescription<Input, Output> = {
  name: "javascriptInterpreter",
  schema: {
    type: "function",
    function: {
      name: "javascriptInterpreter",
      description: "Execute JavaScript code with eval function.",
      parameters: {
        type: "object",
        required: ["source"],
        properties: {
          source: {
            type: "string",
            description:
              "JavaScript source code. Must be compatible with running in the eval function.",
          },
        },
      },
    },
  },
  function: ({ source }) => {
    return eval(source);
  },
  checkArgs: (args): args is Input => {
    const argsSchema = z.object({
      source: z.string(),
    });
    return argsSchema.safeParse(args).success;
  },
};
