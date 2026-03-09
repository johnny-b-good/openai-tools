import z from "zod";

export type ToolArgs = Record<string, unknown>;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ToolDescription<T extends ToolArgs = {}> {
  name: string;
  description: string;
  zodSchema?: z.ZodType<T>;
  toolFunction: (args: T) => string | Promise<string>;
}
