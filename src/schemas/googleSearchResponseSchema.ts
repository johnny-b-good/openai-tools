import z from "zod/v4";

export const googleSearchResponseSchema = z
  .object({
    quality: z
      .enum(["good", "bad"])
      .describe(
        "Quality of search results. Evaluate if these results answer users question",
      ),
    url: z.string().describe("URL of the selected search result"),
    title: z.string().describe("Title of the selected search result"),
    quote: z
      .string()
      .describe(
        "Quote from the selected search result that answers user's question.",
      ),
    finalAnswer: z
      .string()
      .describe(
        "Formulate final answer for user's question based on the selected search result's quote.",
      ),
  })
  .describe(
    "Object containing your conclusions on provided web search results.",
  );
