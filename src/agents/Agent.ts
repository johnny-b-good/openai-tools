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
  private isInitialized: boolean = false;

  constructor({
    openai,
    modelName,
    toolRouter,
  }: {
    openai: OpenAI;
    modelName: string;
    toolRouter: ToolRouter;
  }) {
    this.openai = openai;
    this.modelName = modelName;
    this.toolRouter = toolRouter;
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

  /** Run acting step. */
  async run(
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  ): Promise<string> {
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
          messages: messages,
          tools: this.toolRouter.toolsSchemas,
        });
      } catch (err) {
        if (err instanceof OpenAI.APIError) {
          this.logError("API calling error", err.message);

          messages.push({
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

      this.logInfo(
        "Session tokens count",
        response.usage?.total_tokens.toString() ?? "UNKNOWN",
      );

      // Update messages list
      messages.push(message);

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

            messages.push({
              role: "tool",
              content: toolResult,
              tool_call_id: toolCall.id,
            });
          } catch (err) {
            if (err instanceof Error) {
              this.logError("Tool error", err.message);
              messages.push({
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
          messages.push({
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

  private logReply(msg: string) {
    console.log(`${chalk.green("●")} ${chalk.bold("Agent:")} ${msg}`);
  }

  private logInfo(msg: string, data?: string) {
    if (config.VERBOSE) {
      const msgFmt = data ? `${msg}: ` : msg;
      console.log(chalk.grey(`○ ${chalk.bold(msgFmt)}${data ?? ""}`));
    }
  }

  private logError(msg: string, data?: string) {
    const msgFmt = data ? `${msg}: ` : msg;
    console.log(chalk.red(`○ ${chalk.bold(msgFmt)}${data ?? ""}`));
  }
}
