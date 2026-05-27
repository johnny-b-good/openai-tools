import { spawn } from "child_process";

import z from "zod";

import { config } from "../../utils";
import { StandaloneTool } from "../standaloneTools";

interface CommandResult {
  success: boolean;
  stdout: string;
  stderr?: string;
  exitCode?: number | null;
}

const SHELL_COMMAND_TIMEOUT_MS = 10000;

export class UnixTool<T> extends StandaloneTool<T> {
  constructor({
    name,
    description,
    zodSchema,
    command,
    getCommandArgs: getArgs,
  }: {
    name: string;
    description: string;
    zodSchema: z.ZodType<T>;
    command: string;
    getCommandArgs: (args: T) => Array<string>;
  }) {
    super({
      name,
      description,
      zodSchema,
      toolFunction: async (args) => {
        return await this.safeSpawn(command, getArgs(args));
      },
    });
  }

  private async safeSpawn(cmd: string, args: string[]): Promise<string> {
    const result: CommandResult = await new Promise((resolve) => {
      // Check if any argument tries to escape the sandbox via '..'
      for (const arg of args) {
        if (arg.includes("..")) {
          return resolve({
            success: false,
            stdout: "",
            stderr: "Illegal argument: Path traversal detected.",
          });
        }
      }

      const controller = new AbortController();
      const { signal } = controller;

      const timeout = setTimeout(() => {
        controller.abort();
      }, SHELL_COMMAND_TIMEOUT_MS);

      const childProcess = spawn(cmd, args, {
        cwd: config.filesystemAccessRoot, // Run inside the sandbox
        signal,
        shell: false, // Do not use a shell
      });

      let stdout = "";
      let stderr = "";

      // TODO: Add output size constraint

      childProcess.stdout.on("data", (data) => (stdout += data.toString()));

      childProcess.stderr.on("data", (data) => (stderr += data.toString()));

      childProcess.on("close", (code) => {
        clearTimeout(timeout);
        resolve({
          success: code === 0,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          exitCode: code,
        });
      });

      childProcess.on("error", (err) => {
        clearTimeout(timeout);
        if (err.name === "AbortError") {
          resolve({
            success: false,
            stdout: "",
            stderr: "Command timed out.",
          });
        } else {
          resolve({ success: false, stdout: "", stderr: err.message });
        }
      });
    });

    const formattedResult = Object.entries(result)
      .map(
        ([key, value]) =>
          `[${key.toUpperCase()}]\n${value || "<EMPTY CONTENT>"}`,
      )
      .join("\n\n");

    return formattedResult;
  }
}
