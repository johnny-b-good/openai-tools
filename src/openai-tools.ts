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

  let prompt: string;
  try {
    prompt = await input({
      message: "Prompt:",
    });
  } catch {
    process.exit(1);
  }

  agent.pushUserMessage(prompt);
  await agent.run();
  await toolRouter.disconnectAll();
};

main().catch((err) => {
  console.error(err);
});
