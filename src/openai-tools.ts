import OpenAI from "openai";
import { input } from "@inquirer/prompts";
import chalk from "chalk";

import { config, logger } from "./utils";

const openai = new OpenAI({
  baseURL: config.openaiBaseUrl,
  apiKey: config.openaiApiKey,
});

const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

const main = async () => {
  while (true) {
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

    const stream = await openai.chat.completions.create({
      model: config.openaiModel,
      messages,
      stream: true,
    });

    process.stdout.write(`${chalk.green("✔")} ${chalk.red("[AI]: ")}`);
    let responseText = "";
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      process.stdout.write(content);
      responseText += content;
    }
    process.stdout.write("\n");

    messages.push({
      role: "assistant",
      content: responseText,
    });
  }
};

main().catch((err) => {
  logger.error(err);
});
