import z from "zod/v4";

export const googleSearchResponseSchema = z
  .object({
    quality: z
      .enum(["good", "bad"])
      .describe(
        "Quality of search results. Evaluate if these results answer users question.",
      ),

    answer: z
      .string()
      .describe(
        "Formulate final answer for user's question based on the selected search results.",
      ),
  })
  .describe(
    "Object containing your conclusions on provided web search results.",
  );
