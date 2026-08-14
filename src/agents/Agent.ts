import OpenAI from "openai";
import chalk from "chalk";
import ora from "ora";

import type { ToolRouter } from "../tools/ToolRouter";
import { config } from "../utils";

const MAX_STEPS_NUMBER = 32;

const spinner = ora({
  text: "Thinking",
  spinner: "dots13",
});

type ReasoningChatCompletionMessage =
  OpenAI.Chat.Completions.ChatCompletionMessage & {
    reasoning_content?: string;
  };

export class Agent {
  private openai: OpenAI;
  private modelName: string;
  private toolRouter: ToolRouter;
  private messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
  private isInitialized: boolean = false;

  constructor({
    openai,
    modelName,
    systemPrompt,
    toolRouter,
  }: {
    openai: OpenAI;
    modelName: string;
    systemPrompt: string;
    toolRouter: ToolRouter;
  }) {
    this.openai = openai;
    this.modelName = modelName;
    this.toolRouter = toolRouter;
    this.messages = [
      {
        role: "system",
        content: systemPrompt,
      },
    ];
  }

  async init() {
    this.logInfo("Initializing the agent");
    await this.toolRouter.connectAll();
    this.isInitialized = true;
  }

  private checkForInit() {
    if (!this.isInitialized) {
      throw new Error("Please call the init method before using the agent");
    }
  }

  pushUserMessage(msg: string) {
    this.checkForInit();

    this.messages.push({
      role: "user",
      content: msg,
    });
  }

  /** Run acting step. */
  async run(): Promise<string> {
    this.checkForInit();

    let stepNum = 0;

    while (stepNum < MAX_STEPS_NUMBER) {
      stepNum++;

      spinner.start();

      /** LLM response object. */
      let response: OpenAI.Chat.Completions.ChatCompletion;

      try {
        response = await this.openai.chat.completions.create({
          model: this.modelName,
          messages: this.messages,
          tools: this.toolRouter.toolsSchemas,
        });
      } catch (err) {
        if (err instanceof OpenAI.APIError) {
          this.logError("API calling error", err.message);

          this.messages.push({
            role: "system",
            content: `API calling error: ${err.message}`,
          });

          continue;
        } else {
          throw err;
        }
      }

      spinner.stop();

      /** LLM response message. */
      const message = response.choices[0]
        .message as ReasoningChatCompletionMessage;

      // Update messages list
      this.messages.push(message);

      if (message.reasoning_content) {
        this.logInfo("Agent reasoning", message.reasoning_content.trim());
      }

      // If there were no tool calls then LLM has completed the task
      if (!message.tool_calls || message.tool_calls.length === 0) {
        const agentReply = message.content ?? "No response generated.";
        this.logReply(agentReply.trim());
        return agentReply;
      }

      // Run tool calls
      for (const toolCall of message.tool_calls) {
        if (toolCall.type === "function") {
          const toolName = toolCall.function.name;
          const toolArguments = toolCall.function.arguments;

          // Log tool name and arguments
          this.logInfo("Tool call", toolName);
          this.logInfo("Tool args", toolArguments);

          // Execute tool, save it's results.
          try {
            const toolResult = await this.toolRouter.runTool(
              toolName,
              toolArguments,
            );

            this.logInfo("Tool result", toolResult);

            this.messages.push({
              role: "tool",
              content: toolResult,
              tool_call_id: toolCall.id,
            });
          } catch (err) {
            if (err instanceof Error) {
              this.logError("Tool error", err.message);
              this.messages.push({
                role: "tool",
                content: `Tool call error: ${err.name}; ${err.message}`,
                tool_call_id: toolCall.id,
              });
            } else {
              throw err;
            }
          }
        } else {
          this.logError("Unsupported tool type", toolCall.type);
          this.messages.push({
            role: "tool",
            content: "Unsupported tool type",
            tool_call_id: toolCall.id,
          });
        }
      }
    }

    return "Error: maximum step number reached";
  }

  async destroy() {
    await this.toolRouter.disconnectAll();
  }

  private logReply(message: string) {
    console.log(`${chalk.green("●")} ${chalk.bold("Agent:")} ${message}`);
  }

  private logInfo(type: string, data?: string) {
    if (config.VERBOSE) {
      const typeFmt = data ? `${type}: ` : type;
      console.log(chalk.grey(`○ ${chalk.bold(typeFmt)}${data ?? ""}`));
    }
  }

  private logError(type: string, data?: string) {
    const typeFmt = data ? `${type}: ` : type;
    console.log(chalk.red(`○ ${chalk.bold(typeFmt)}${data ?? ""}`));
  }
}
