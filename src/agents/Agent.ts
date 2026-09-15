import EventEmitter from "node:events";

import OpenAI from "openai";

import type { ToolRouter } from "../tools/ToolRouter";

const MAX_STEPS_NUMBER = 32;

const ERR_API_CALL_FAILED = "ERR_API_CALL_FAILED";
const ERR_MAX_STEP_REACHED = "ERR_MAX_STEP_REACHED";

export type AgentMessages =
  OpenAI.Chat.Completions.ChatCompletionMessageParam[];

export type AgentReply =
  | { status: "ok"; reply: string }
  | { status: "error"; code: string; data?: string };

type ReasoningChatCompletionMessage =
  OpenAI.Chat.Completions.ChatCompletionMessage & {
    reasoning_content?: string;
  };

export class Agent {
  private openai: OpenAI;
  private modelName: string;
  private toolRouter: ToolRouter;
  private isInitialized: boolean = false;
  public events: EventEmitter<{
    reply: [msg: string];
    info: [msg: string, data?: string];
    error: [msg: string, data?: string];
    startThinking: [];
    stopThinking: [];
  }>;

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
    this.events = new EventEmitter();
  }

  async init() {
    this.logInfo("Initializing the agent");

    await this.toolRouter.connectAll();

    this.isInitialized = true;

    const formattedToolList = this.toolRouter.enabledTools.map(
      ({ provider, tools }) => `- ${provider}: [${tools.join(", ")}]`,
    );

    this.logInfo("All enabled tools", `\n${formattedToolList.join("\n")}`);

    this.logInfo("Agent initialized");
  }

  private checkForInit() {
    if (!this.isInitialized) {
      throw new Error("Please call the init method before using the agent");
    }
  }

  /** Run acting step. */
  async run(messages: AgentMessages): Promise<AgentReply> {
    this.checkForInit();

    let stepNum = 0;

    while (stepNum < MAX_STEPS_NUMBER) {
      stepNum++;

      this.startThinking();

      /** LLM response object. */
      let response: OpenAI.Chat.Completions.ChatCompletion;

      try {
        response = await this.openai.chat.completions.create({
          model: this.modelName,
          messages: messages,
          tools: this.toolRouter.toolsSchemas,
        });
      } catch (err) {
        const errMessage = err instanceof Error ? err.message : undefined;

        this.logError("Failed to call LLM API", errMessage);

        return {
          status: "error",
          code: ERR_API_CALL_FAILED,
          data: errMessage,
        };
      } finally {
        this.stopThinking();
      }

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
        const agentReply = message.content?.trim() ?? "No response generated.";
        this.logReply(agentReply);
        return { status: "ok", reply: agentReply };
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
              this.logError("Tool call error", err.message);
              messages.push({
                role: "tool",
                content: `Tool call error: ${err.message}`,
                tool_call_id: toolCall.id,
              });
            } else {
              throw err;
            }
          }
        } else {
          this.logError(
            "Tool call error: Unsupported tool type",
            toolCall.type,
          );
          messages.push({
            role: "tool",
            content: `Tool call error: Unsupported tool type ${toolCall.type}`,
            tool_call_id: toolCall.id,
          });
        }
      }
    }

    this.logError("Maximum number of steps reached");
    return { status: "error", code: ERR_MAX_STEP_REACHED };
  }

  async destroy() {
    await this.toolRouter.disconnectAll();
  }

  private logReply(msg: string) {
    this.events.emit("reply", msg);
  }

  private logInfo(msg: string, data?: string) {
    this.events.emit("info", msg, data);
  }

  private logError(msg: string, data?: string) {
    this.events.emit("error", msg, data);
  }

  private startThinking() {
    this.events.emit("startThinking");
  }

  private stopThinking() {
    this.events.emit("stopThinking");
  }
}
