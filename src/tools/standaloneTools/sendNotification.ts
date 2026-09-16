import { execFile } from "node:child_process";
import z from "zod";

import { StandaloneTool } from "./StandaloneTool";
import { config } from "../../utils";

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
          `--hint=string:desktop-entry:${config.NOTIFICATION_APP_DESKTOP_ENTRY}`,
          "--app-name",
          config.NOTIFICATION_APP_NAME,
          "-t",
          config.NOTIFICATION_TIMEOUT,
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
