import OpenAI from "openai";
import { input, select } from "@inquirer/prompts";

import { Agent } from "../agents";

type Command = "save" | "load" | "regenerate" | "undo" | "cancel";

export class TUI {
  private agent: Agent;
  private messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];

  constructor({
    agent,
    messages,
  }: {
    agent: Agent;
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  }) {
    this.agent = agent;
    this.messages = messages;
  }

  async run() {
    while (true) {
      // TODO:
      const prompt = await input({
        message: "User:",
      });

      if (prompt === "") {
        const command = await select<Command>({
          message: "Select a command",
          choices: ["save", "load", "regenerate", "undo", "cancel"],
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
}
