import { type OpenAI } from "openai";

export interface ToolDescription<
  Input extends {
    [key: string]: unknown;
  },
  Output,
> {
  /** Tool's name */
  name: string;
  /** Tool description schema */
  schema: OpenAI.Responses.FunctionTool;
  /** Tool function */
  function: (args: Input) => Output;
  /** Tool args validator */
  checkArgs: (args: unknown) => args is Input;
}
