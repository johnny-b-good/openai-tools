import { buildSystemPrompt, type SystemPromptContext } from "./utils";
import { config } from "./config";
import { openai } from "./consts";
import { ToolRouter } from "./tools";
import { Agent, type AgentMessages } from "./agents";
import { TUI } from "./tui";

const main = async () => {
  const systemPromptContext: SystemPromptContext = {
    currentTime: new Date().toLocaleString(),
    workingDirectory: config.workingDirPath,
  };

  const systemPrompt = buildSystemPrompt(
    config.promptPartsPaths,
    systemPromptContext,
  );

  const messages: AgentMessages = [
    {
      role: "system",
      content: systemPrompt,
    },
  ];

  const agent = new Agent({
    openai,
    modelName: config.api.model,
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
