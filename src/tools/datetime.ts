import { type ToolDescription } from "../types";
import * as z from "zod/v4";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type Input = {};
type Output = string;

export const datetime: ToolDescription<Input, Output> = {
  name: "datetime",
  schema: {
    type: "function",
    name: "datetime",
    description: "Get the current date and time in ISO format",
    parameters: {
      type: "object",
      properties: {},
    },
    strict: true,
  },
  function: () => {
    return new Date().toISOString();
  },
  checkArgs: (args): args is Input => {
    const argsSchema = z.object({});
    return argsSchema.safeParse(args).success;
  },
};
