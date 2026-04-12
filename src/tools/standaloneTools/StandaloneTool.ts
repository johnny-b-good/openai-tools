import z from "zod";
import type OpenAI from "openai";

export type ToolArgs = Record<string, unknown>;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export class StandaloneTool<T extends ToolArgs = {}> {
  name: string;
  private description: string;
  private zodSchema?: z.ZodType<T>;
  private toolFunction: (args: T) => string | Promise<string>;
  toolSchema: OpenAI.Chat.Completions.ChatCompletionFunctionTool;

  constructor({
    name,
    description,
    zodSchema,
    toolFunction,
  }: {
    name: string;
    description: string;
    zodSchema?: z.ZodType<T>;
    toolFunction: (args: T) => string | Promise<string>;
  }) {
    this.name = name;
    this.description = description;
    this.zodSchema = zodSchema;
    this.toolFunction = toolFunction;
    this.toolSchema = this.makeToolSchema();
  }

  runTool = async (toolArgs: string) => {
    let args;
    try {
      args = JSON.parse(toolArgs);
    } catch {
      throw new Error("Malformed tool arguments");
    }

    if (this.zodSchema && this.zodSchema.safeParse(args).error) {
      throw new Error("Bad tool arguments");
    }

    return await this.toolFunction(args);
  };

  private makeToolSchema =
    (): OpenAI.Chat.Completions.ChatCompletionFunctionTool => ({
      type: "function",
      function: {
        name: this.name,
        description: this.description,
        parameters: this.zodSchema
          ? z.toJSONSchema(this.zodSchema)
          : {
              type: "object",
              properties: {},
              required: [],
            },
      },
    });
}
