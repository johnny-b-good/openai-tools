import z from "zod/v4";

export const responseSchema = z
  .object({
    status: z
      .enum(["done", "working", "fail"])
      .describe(
        "Status of the task. Status 'done' indicates that the task is complete. Status 'working' indicates that the work is in progress. Status 'fail' indicates that task cannot be completed.",
      ),
    thoughts: z
      .string()
      .describe(
        "Thoughts that describe current task status and reasoning for the next required steps.",
      ),
  })
  .describe(
    "Object containing description of current task status and related thoughts ",
  );
