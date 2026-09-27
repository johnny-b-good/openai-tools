import chalk from "chalk";
import ora from "ora";
import { input, select } from "@inquirer/prompts";
import boxen, { type Options as BoxenOptions } from "boxen";

import { Agent, type AgentMessages } from "../agents";
import { config } from "../config.ts";

type Command = "save" | "load" | "regenerate" | "undo" | "cancel";

const spinner = ora({
  text: "Thinking",
  spinner: "dots13",
});

const commonBoxenOptions: BoxenOptions = {
  titleAlignment: "left",
  maxWidth: 80,
  margin: 0,
  padding: 1,
  dimBorder: true,
};

export class TUI {
  private agent: Agent;
  private messages: AgentMessages;

  constructor({ agent, messages }: { agent: Agent; messages: AgentMessages }) {
    this.agent = agent;
    this.messages = messages;

    this.agent.events.on("reply", this.logReply);
    this.agent.events.on("info", this.logInfo);
    this.agent.events.on("error", this.logError);
    this.agent.events.on("startThinking", this.startThinking);
    this.agent.events.on("stopThinking", this.stopThinking);
  }

  async run() {
    while (true) {
      const prompt = await input(
        {
          message: "User:",
        },
        {
          clearPromptOnDone: true,
        },
      );

      this.logPrompt(prompt);

      if (prompt === "") {
        const command = await select<Command>({
          message: "Select a command",
          choices: ["cancel", "save", "load", "regenerate", "undo"],
          default: "cancel",
        });

        if (command === "save") {
          this.onSessionSave();
        } else if (command === "load") {
          this.onSessionLoad();
        } else if (command === "regenerate") {
          this.onRegenerate();
        } else if (command === "undo") {
          this.onUndo();
        } else if (command === "cancel") {
          continue;
        }
      } else {
        await this.onMessage(prompt);
      }
    }
  }

  // TODO
  private async onSessionSave() {
    console.log("onSessionSave");
  }

  // TODO
  private async onSessionLoad() {
    console.log("onSessionLoad");
  }

  private async onMessage(prompt: string) {
    this.messages.push({
      role: "user",
      content: prompt,
    });

    await this.agent.run(this.messages);
  }

  // TODO
  private async onUndo() {
    console.log("onUndo");
  }

  // TODO
  private async onRegenerate() {
    console.log("onRegenerate");
  }

  private logPrompt(msg: string) {
    console.log(
      boxen(msg, {
        ...commonBoxenOptions,
        title: config.userName,
        borderColor: "green",
      }),
    );
  }

  private logReply(msg: string) {
    console.log(
      boxen(msg, {
        ...commonBoxenOptions,
        title: config.agentName,
        borderColor: "cyan",
      }),
    );
  }

  private logInfo(msg: string, data?: string) {
    if (config.verbose) {
      const msgFmt = data ? `${msg}: ` : msg;
      console.log(chalk.grey(`○ ${chalk.bold(msgFmt)}${data ?? ""}`));
    }
  }

  private logError(msg: string, data?: string) {
    const msgFmt = data ? `${msg}: ` : msg;
    console.log(chalk.red(`○ ${chalk.bold(msgFmt)}${data ?? ""}`));
  }

  private startThinking() {
    spinner.start();
  }

  private stopThinking() {
    spinner.stop();
  }
}
