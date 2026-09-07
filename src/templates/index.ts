import fs from "node:fs";
import path from "node:path";

import Handlebars from "handlebars";

const makeTemplate = <T>(filename: string) => {
  const templateStr = fs.readFileSync(
    path.join("src", "templates", filename),
    "utf-8",
  );
  return Handlebars.compile<T>(templateStr);
};

export const systemPromptTemplate = makeTemplate<{
  currentTime: string;
  workingDirectory: string;
  extraSystemPrompt: string;
}>("systemPrompt.hbs");
