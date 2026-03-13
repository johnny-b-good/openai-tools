import OpenAI from "openai";
import { input } from "@inquirer/prompts";
import chalk from "chalk";

import { config } from "./utils";
import { simpleSystemPromptTemplate } from "./templates";
import { openai } from "./consts";
import { toolRouter } from "./tools";

const MAX_STEPS_NUMBER = 16;

const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

const main = async () => {
  await initSystem();

  await toolRouter.connectAll();

  await readUserPrompt();

  let stepNum = 0;
  while (stepNum < MAX_STEPS_NUMBER) {
    stepNum++;
    console.log(chalk.green(`ROUND ${stepNum}`));

    const stepResult = await runStep();

    if (stepResult) {
      break;
    }

    if (stepNum === MAX_STEPS_NUMBER) {
      console.warn("Reached steps limit");
    }
  }
};

/** Init the agent with system prompt */
const initSystem = async () => {
  messages.push({
    role: "system",
    content: simpleSystemPromptTemplate({}),
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

/** Run acting step. */
const runStep = async () => {
  /** LLM response object. */
  const response = await openai.chat.completions.create({
    model: config.openaiModel,
    messages,
    tools: toolRouter.toolsSchemas,
  });

  /** LLM response message. */
  const message = response.choices[0].message;

  // Update messages list
  messages.push(message);

  if (message.reasoning_content) {
    console.log(`${chalk.cyan("Reasoning:")} ${message.reasoning_content}`);
  }

  // If there were no tool calls then LLM has completed the task
  if (!message.tool_calls || message.tool_calls.length === 0) {
    console.log(`${chalk.cyan("Agent:")} ${message.content}`);
    return message.content || "No response generated.";
  }

  // Run tool calls
  for (const toolCall of message.tool_calls) {
    if (toolCall.type === "function") {
      const toolName = toolCall.function.name;
      const toolArguments = toolCall.function.arguments;

      // Log tool name and arguments
      console.log(`${chalk.cyan("Tool name:")} ${toolName}`);
      console.log(`${chalk.cyan("Tool arguments:")} ${toolArguments}`);

      // Execute tool, save it's results.
      try {
        const toolResult = await toolRouter.runTool(toolName, toolArguments);

        console.log(`${chalk.cyan("Tool result:")} ${toolResult}`);

        messages.push({
          role: "tool",
          content: toolResult,
          tool_call_id: toolCall.id,
        });
      } catch (err) {
        if (err instanceof Error) {
          console.log(
            `${chalk.red("Tool error:")} ${err.name}\n${err.message}`,
          );
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
      console.warn("Unsupported tool type");
    }
  }
};

main().catch((err) => {
  console.error(err);
});
