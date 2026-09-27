import fs from "node:fs";

import Handlebars from "handlebars";

export type SystemPromptContext = Record<string, string>;

export const buildSystemPrompt = (
  filePaths: Array<string>,
  context: SystemPromptContext,
): string => {
  return filePaths
    .map((p) => {
      let templateStr;
      try {
        templateStr = fs.readFileSync(p, "utf-8");
      } catch {
        throw new Error(`Error: failed to read template file ${p}`);
      }

      try {
        const template = Handlebars.compile(templateStr);
        return template(context);
      } catch {
        throw new Error(`Error: failed to render template file ${p}`);
      }
    })
    .join("\n\n");
};
