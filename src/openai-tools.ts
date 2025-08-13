import OpenAI from "openai";
import { input } from "@inquirer/prompts";
import chalk from "chalk";

import { config, logger } from "./utils";
import { makeAToolCall, allToolDescriptions, allToolSchemas } from "./tools";
import { toolsSystemPromptTemplate } from "./prompts";

const MAX_STEPS_NUMBER = 10;

const openai = new OpenAI({
  baseURL: config.openaiBaseUrl,
  apiKey: config.openaiApiKey,
});

const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

const main = async () => {
  messages.push({
    role: "system",
    content: toolsSystemPromptTemplate({
      toolsDescription: allToolDescriptions,
    }),
  });

  let prompt: string;
  try {
    prompt = await input({
      message: chalk.blue("[User]:"),
    });
  } catch {
    process.exit(1);
  }

  messages.push({
    role: "user",
    content: prompt,
  });

  let stepNum = 1;
  while (stepNum < MAX_STEPS_NUMBER) {
    // Step 1: Reasoning
    const reasoningResponse = await openai.chat.completions.create({
      model: config.openaiModel,
      messages,
    });

    const reasoningMessage = reasoningResponse.choices[0].message;
    messages.push(reasoningMessage);
    logger.info(`[Reasoning]\n${reasoningMessage.content ?? "EMPTY"}`);

    if (reasoningMessage.content === null) {
      logger.warn("Recieved empty reasoning message content. Odd.");
      process.exit(1);
    }

    if (
      reasoningMessage.content.includes("__DONE__") ||
      reasoningMessage.content.includes("__IMPOSSIBLE__")
    ) {
      break;
    }

    messages.push({
      role: "user",
      content: "Call the tool you have chosen with required params",
    });

    // Step 2: Acting
    const actingResponse = await openai.chat.completions.create({
      model: config.openaiModel,
      messages,
      tools: allToolSchemas,
    });
    const actingMessage = actingResponse.choices[0].message;
    messages.push(actingMessage);

    if (actingMessage.tool_calls) {
      for (const toolCall of actingMessage.tool_calls) {
        if (toolCall.type === "function") {
          const toolName = toolCall.function.name;
          const toolArguments = toolCall.function.arguments;
          const toolArgumentsParsed = JSON.parse(toolArguments);

          logger.info(`[Acting]\nTool name: ${toolName}`);
          if (
            toolName === "javascriptInterpreter" &&
            "source" in toolArgumentsParsed &&
            typeof toolArgumentsParsed.source === "string"
          ) {
            logger.info(toolArgumentsParsed.source, "[Acting]\nTool params: ");
          } else {
            logger.info(toolArgumentsParsed, "[Acting]\nTool params: ");
          }

          const toolResult = makeAToolCall(toolName, toolArgumentsParsed);
          logger.info(`[Acting]\nTool result: ${toolResult}`);

          messages.push({
            role: "tool",
            content: toolResult.toString(),
            tool_call_id: toolCall.id,
          });
        } else {
          logger.warn("Unsupported tool type");
        }
      }
    } else {
      logger.warn("No tool calls returned from model");
    }

    stepNum++;
  }

  messages.push({
    role: "user",
    content: "Formulate your final response to the initial user's task",
  });

  const finalResponse = await openai.chat.completions.create({
    model: config.openaiModel,
    messages,
  });

  const finalMessage = finalResponse.choices[0].message;
  messages.push(finalMessage);

  console.log(
    `${chalk.green("✔")} ${chalk.red("[AI]:")} ${finalMessage.content ?? "NO RESPONSE CONTENT"}`,
  );
};

main().catch((err) => {
  logger.error(err);
});
