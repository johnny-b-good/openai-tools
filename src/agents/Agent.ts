import OpenAI from "openai";

import type { ToolRouter } from "../tools/ToolRouter";
import { logger } from "../utils";

const MAX_STEPS_NUMBER = 32;

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
    await this.toolRouter.connectAll();
    this.isInitialized = true;
  }

  private checkForInit() {
    if (!this.isInitialized) {
      throw new Error("Please call the init method befor using the agent");
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
          logger.error(`API calling error: ${err.message}`);

          this.messages.push({
            role: "system",
            content: `API calling error: ${err.message}`,
          });

          continue;
        } else {
          throw err;
        }
      }

      /** LLM response message. */
      const message = response.choices[0].message;

      // Update messages list
      this.messages.push(message);

      if (message.reasoning_content) {
        logger.info("Agent reasoning: %s", message.reasoning_content);
      }

      // If there were no tool calls then LLM has completed the task
      if (!message.tool_calls || message.tool_calls.length === 0) {
        const agentReply = message.content ?? "No response generated.";
        logger.info("Agent reply: %s", agentReply);
        return agentReply;
      }

      // Run tool calls
      for (const toolCall of message.tool_calls) {
        if (toolCall.type === "function") {
          const toolName = toolCall.function.name;
          const toolArguments = toolCall.function.arguments;

          // Log tool name and arguments
          logger.info("Tool call: %s %s", toolName, toolArguments);

          // Execute tool, save it's results.
          try {
            const toolResult = await this.toolRouter.runTool(
              toolName,
              toolArguments,
            );

            logger.info("Tool result: %s", toolResult);

            this.messages.push({
              role: "tool",
              content: toolResult,
              tool_call_id: toolCall.id,
            });
          } catch (err) {
            if (err instanceof Error) {
              logger.warn("Tool error: %s %s", err.name, err.message);
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
          logger.warn("Unsupported tool type");
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
}
