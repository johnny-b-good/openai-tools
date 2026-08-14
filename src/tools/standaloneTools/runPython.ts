import { spawn } from "node:child_process";
import z from "zod";

import { StandaloneTool } from "./StandaloneTool";
import { config } from "../../utils";

const PYTHON_EXECUTION_TIMEOUT = 30000;
const CONTAINER_WORKDIR = "/data";

export const runPython = new StandaloneTool({
  name: "run_python",
  description:
    "Executes Python code inside a sandboxed Docker container. The container is ephemeral and wiped after execution. Use this for math, data manipulation, and complex logic. Use print() to see the output. The working directory is mounted is mounted as /data.",
  zodSchema: z.object({
    code: z.string().describe("The Python code to execute."),
  }),
  toolFunction: async ({ code }) => {
    return new Promise((resolve) => {
      const docker = spawn("docker", [
        "run",
        "--mount",
        `type=bind,source=${config.WORKING_DIRECTORY},target=/${CONTAINER_WORKDIR}`,
        "--workdir",
        CONTAINER_WORKDIR,
        "--rm",
        "-i",
        config.PYTHON_DOCKER_IMAGE_TAG,
        "python",
        "-",
      ]);

      let stdout = "";
      let stderr = "";

      docker.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      docker.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      docker.on("close", (code) => {
        if (code === 0) {
          resolve(stdout || "Code executed successfully (no output).");
        } else {
          resolve(
            `Python execution error (exit code ${code}):\n${stderr || stdout}`,
          );
        }
      });

      docker.on("error", (err) => {
        resolve(`Failed to start Docker container: ${err.message}`);
      });

      docker.stdin.write(code);
      docker.stdin.end();

      const timeout = setTimeout(() => {
        docker.kill();
        resolve("Python execution timed out.");
      }, PYTHON_EXECUTION_TIMEOUT);

      docker.on("close", () => clearTimeout(timeout));
    });
  },
});
