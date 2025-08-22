import OpenAI from "openai";
import { input } from "@inquirer/prompts";
import chalk from "chalk";
import z from "zod/v4";

import { config } from "./utils";
import { makeAToolCall, allToolDescriptions, allToolSchemas } from "./tools";
import { simpleSystemPromptTemplate } from "./prompts";
import { responseSchema } from "./schemas";

const MAX_STEPS_NUMBER = 10;

const openai = new OpenAI({
  baseURL: config.openaiBaseUrl,
  apiKey: config.openaiApiKey,
});

const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

const main = async () => {
  await initSystem();
  await readUserPrompt();

  let stepNum = 1;
  while (stepNum < MAX_STEPS_NUMBER) {
    console.log(chalk.green(`ROUND ${stepNum}`));

    const status = await runReasoningStep();

    if (status === "done" || status === "fail") {
      break;
    }

    await runActingStep();

    stepNum++;

    console.log("");

    if (stepNum === MAX_STEPS_NUMBER) {
      console.warn("Reached steps limit");
    }
  }

  await generateFinalResponse();
};

/** Init the agent with system prompt */
const initSystem = async () => {
  messages.push({
    role: "system",
    content: simpleSystemPromptTemplate({
      toolsDescription: allToolDescriptions,
    }),
  });
};

/** Read user's prompt from input. */
const readUserPrompt = async () => {
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
};

/**
 * Run reasoning step.
 *
 * Determine task status and next required step.
 */
const runReasoningStep = async () => {
  const reasoningResponse = await openai.chat.completions.create({
    model: config.openaiModel,
    messages,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "response",
        schema: z.toJSONSchema(responseSchema),
      },
    },
  });

  const reasoningMessage = reasoningResponse.choices[0].message;
  messages.push(reasoningMessage);

  try {
    if (!reasoningMessage.content) {
      throw new Error("Empty content message");
    }

    const reasoningMessageJson = JSON.parse(reasoningMessage.content);

    const reasoningMessageParsed = responseSchema.parse(reasoningMessageJson);

    console.log(
      `${chalk.blue("[Reasoning]")}\n${chalk.cyan("Status:")} ${reasoningMessageParsed.status}\n${chalk.cyan("Thoughts:")} ${reasoningMessageParsed.thoughts.trim()}`,
    );

    const { status } = reasoningMessageParsed;

    return status;
  } catch (err) {
    console.error(err, "Failed to parse LLM response");
    process.exit(1);
  }
};

/**
 * Run acting step.
 *
 * Select required tools with arguments and run them.
 */
const runActingStep = async () => {
  messages.push({
    role: "user",
    content: "Call the tool you have chosen with required arguments",
  });

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

        let toolCallLog = `${chalk.blue("[Acting]")}\n${chalk.cyan("Tool name:")} ${toolName}\n`;
        if (
          toolName === "runJavaScript" &&
          "source" in toolArgumentsParsed &&
          typeof toolArgumentsParsed.source === "string"
        ) {
          toolCallLog += `${chalk.cyan("Source code:")}\n${toolArgumentsParsed.source}\n`;
        } else {
          toolCallLog += `${chalk.cyan("Tool arguments:")} ${toolArguments}\n`;
        }

        let toolResult;
        try {
          toolResult = makeAToolCall(toolName, toolArgumentsParsed);
          toolCallLog += `${chalk.cyan("Tool result:")} ${toolResult}`;
        } catch (err) {
          if (err instanceof Error) {
            toolResult = `ERROR: ${err.name}; ${err.message}`;
            toolCallLog += `${chalk.red("Tool error:")} ${err.name}\n${err.message}`;
          } else {
            throw err;
          }
        }

        console.log(toolCallLog.trim());

        messages.push({
          role: "tool",
          content: toolResult.toString(),
          tool_call_id: toolCall.id,
        });
      } else {
        console.warn("Unsupported tool type");
      }
    }
  } else {
    console.warn("No tool calls returned from model");
  }
};

/** Generate final response to the user task. */
const generateFinalResponse = async () => {
  messages.push({
    role: "user",
    content: "Formulate your final response to the initial user's task",
  });

  const finalResponse = await openai.chat.completions.create({
    model: config.openaiModel,
    messages,
  });

  console.log("");
  console.log(chalk.green("FINAL ANSWER"));

  const finalMessage = finalResponse.choices[0].message;
  messages.push(finalMessage);
  console.log(finalMessage.content ?? "NO RESPONSE CONTENT");
};

main().catch((err) => {
  console.error(err);
});
