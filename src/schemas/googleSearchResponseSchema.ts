import z from "zod/v4";

export const googleSearchResponseSchema = z
  .object({
    status: z
      .enum(["done", "continue"])
      .describe(
        "Status of the web search task task. Status 'done' indicates that the answer is found. Status 'continue' indicates that further search is needed.",
      ),
    resultQuote: z
      .string()
      .optional()
      .describe("Quote from the search result that answers user's question."),
  })
  .describe(
    "Object containing description of current web search task status and search result quote.",
  );
