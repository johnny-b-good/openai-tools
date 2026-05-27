import { exec } from "node:child_process";
import util from "node:util";

import z from "zod";

import { StandaloneTool } from "./StandaloneTool";

const MAX_BUFFER_SIZE = 10 * 1024 * 1024;
const COMMAND_TIMEOUT = 60 * 1000;

const execAsPromise = util.promisify(exec);

export const runBashCommand = new StandaloneTool({
  name: "run_bash_command",
  description:
    "Executes a bash/shell command in the current environment. Returns the standard output (stdout) and standard error (stderr). Useful for system administration, file manipulation, or running CLI tools.",
  zodSchema: z.object({
    command: z
      .string()
      .describe(
        "The full bash/shell command to execute (e.g., 'ls -la /tmp', 'grep pattern file.txt')",
      ),
  }),
  toolFunction: async ({ command }) => {
    try {
      const { stdout, stderr } = await execAsPromise(command, {
        encoding: "utf-8",
        maxBuffer: MAX_BUFFER_SIZE,
        timeout: COMMAND_TIMEOUT,
      });

      if (stderr) {
        return `Command execution finished.\nStdout: ${stdout}\nStderr: ${stderr}`;
      }

      return `Command executed successfully.\nOutput:\n${stdout}`;
    } catch (error) {
      if (error instanceof Error) {
        return `Command execution error: ${error.name}; ${error.message}`;
      } else {
        return "Unknown error";
      }
    }
  },
});
