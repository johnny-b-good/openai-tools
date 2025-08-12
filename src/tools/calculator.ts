import { type ToolDescription } from "../types";
import * as z from "zod/v4";

type Input = { expression: string };
type Output = number;

export const calculator: ToolDescription<Input, Output> = {
  name: "calculator",
  schema: {
    type: "function",
    name: "calculator",
    description:
      "Run a mathematical calculation written as JavaScript code that could be used in eval() function.",
    parameters: {
      type: "object",
      required: ["expression"],
      properties: {
        expression: {
          type: "string",
          description:
            "A string with expression to evaluate. Should contain only numbers, parentheses, math operators and calls to JavaScript's Math module. You should not use variables or calls to other modules. The expression should be safe to run through eval() function.",
        },
      },
    },
    strict: true,
  },
  function: ({ expression }) => {
    return eval(expression);
  },
  checkArgs: (args): args is Input => {
    const argsSchema = z.object({
      expression: z.string(),
    });
    return argsSchema.safeParse(args).success;
  },
};
