import { input } from "@inquirer/prompts";

import { config } from "./utils";
import { simpleSystemPromptTemplate } from "./templates";
import { openai } from "./consts";
import { toolRouter } from "./tools";
import { Agent } from "./Agent";

const main = async () => {
  const agent = new Agent({
    openai,
    modelName: config.openaiModel,
    systemPrompt: simpleSystemPromptTemplate({}),
    toolRouter,
  });

  await agent.init();

  const prompt = await readUserPrompt();

  agent.pushUserMessage(prompt);
  await agent.run();
};

/** Read user's prompt from input. */
const readUserPrompt = async () => {
  try {
    return await input({
      message: "Prompt:",
    });
  } catch {
    process.exit(1);
  }
};

main().catch((err) => {
  console.error(err);
});
