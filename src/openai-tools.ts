import { input } from "@inquirer/prompts";

import { config } from "./utils";
import { simpleSystemPromptTemplate } from "./templates";
import { openai } from "./consts";
import { ToolRouter } from "./tools";
import { Agent } from "./agents";

const main = async () => {
  const agent = new Agent({
    openai,
    modelName: config.OPENAI_MODEL,
    systemPrompt: simpleSystemPromptTemplate({
      currentTime: new Date().toLocaleString(),
      workingDirectory: config.WORKING_DIRECTORY,
    }),
    toolRouter: new ToolRouter(),
  });

  await agent.init();

  while (true) {
    let prompt: string;
    try {
      prompt = await input({
        message: "User:",
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
