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

export const toolsSystemPromptTemplate = makeTemplate<{
  toolsDescription: string;
}>("toolsSystemPrompt.hbs");

export const simpleSystemPromptTemplate = makeTemplate<{
  toolsDescription: string;
}>("simpleSystemPrompt.hbs");

export const googleSearchSystemPromptTemplate = makeTemplate<{
  question: string;
  query: string;
}>("googleSearchSystemPrompt.hbs");

export const googleSearchResultMessageTemplate = makeTemplate<{
  title: string;
  url: string;
  content: string;
}>("googleSearchResultMessage.hbs");
