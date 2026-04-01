import { input } from "@inquirer/prompts";

import { config } from "./utils";
import { simpleSystemPromptTemplate } from "./templates";
import { openai } from "./consts";
import { ToolRouter } from "./tools";
import { Agent } from "./agents";

const main = async () => {
  const agent = new Agent({
    openai,
    modelName: config.openaiModel,
    systemPrompt: simpleSystemPromptTemplate({}),
    toolRouter: new ToolRouter({
      enabledMcps: config.enabledMcps,
      enabledTools: config.enabledTools,
    }),
  });

  await agent.init();

  while (true) {
    let prompt: string;
    try {
      prompt = await input({
        message: "Prompt:",
      });
    } catch {
      await agent.destroy();
      process.exit(1);
    }

    agent.pushUserMessage(prompt);
    await agent.run();
  }
};

main().catch((err) => {
  console.error(err);
});
