import z from "zod/v4";

export const pageSummaryResponseSchema = z
  .object({
    grade: z
      .enum(["good", "bad"])
      .describe(
        "Grade indicates how well page's content answers user's question",
      ),

    summary: z
      .string()
      .describe(
        "Accurate and detailed summary of the page content. Focus on answering user's question.",
      ),
  })
  .describe("Object containing grade and summary of the search result.");
