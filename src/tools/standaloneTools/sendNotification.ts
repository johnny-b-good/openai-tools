import { execFile } from "node:child_process";
import z from "zod";

import { StandaloneTool } from "./StandaloneTool";
import { config } from "../../config";

const DEFAULT_APP_NAME = "MAI";
const DEFAULT_APP_DESKTOP_ENTRY = "mai";
const DEFAULT_TIMEOUT = "10000"; // 10 seconds

export const sendNotification = new StandaloneTool({
  name: "send_notification",
  description: "Send a desktop notification to the user.",
  zodSchema: z.object({
    title: z.string().describe("Notification title text."),
    message: z.string().describe("Notification body text."),
  }),
  toolFunction: async ({ title, message }) => {
    return new Promise((resolve) => {
      execFile(
        "/usr/bin/notify-send",
        [
          `--hint=string:desktop-entry:${config.tools.sendNotification?.appDesktopEntry ?? DEFAULT_APP_DESKTOP_ENTRY}`,
          "--app-name",
          config.tools.sendNotification?.appName ?? DEFAULT_APP_NAME,
          "-t",
          config.tools.sendNotification?.timeout ?? DEFAULT_TIMEOUT,
          title,
          message,
        ],
        (error) => {
          if (error) {
            resolve(`Failed to send notification: ${error.message}`);
          }
          resolve("OK");
        },
      );
    });
  },
});
