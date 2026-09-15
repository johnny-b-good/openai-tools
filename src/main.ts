import fs from "node:fs/promises";

import { config } from "./utils";
import { systemPromptTemplate } from "./templates";
import { openai } from "./consts.ts";
import { ToolRouter } from "./tools";
import { Agent, type AgentMessages } from "./agents";
import { TUI } from "./tui";

const main = async () => {
  const extraSystemPrompt = await fs.readFile(
    config.EXTRA_SYSTEM_PROMPT,
    "utf-8",
  );

  const systemPrompt = systemPromptTemplate({
    currentTime: new Date().toLocaleString(),
    workingDirectory: config.WORKING_DIRECTORY,
    extraSystemPrompt,
  });

  const messages: AgentMessages = [
    {
      role: "system",
      content: systemPrompt,
    },
  ];

  const agent = new Agent({
    openai,
    modelName: config.OPENAI_MODEL,
    toolRouter: new ToolRouter(),
  });

  const tui = new TUI({ agent, messages });

  await agent.init();

  try {
    await tui.run();
  } catch {
    await agent.destroy();
    process.exit(1);
  }
};

main().catch((err) => {
  console.error(err);
});
