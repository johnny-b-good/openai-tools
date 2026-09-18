import { MCPClient } from "./MCPClient";

import { config } from "../../utils";

export const mailMcp = new MCPClient({
  name: "mail",
  command: "npx",
  args: ["-y", "mail-mcp"],
  env: {
    SMTP_HOST: config.SMTP_HOST,
    SMTP_PORT: config.SMTP_PORT.toString(),
    SMTP_SECURE: config.SMTP_SECURE.toString(),
    IMAP_HOST: config.IMAP_HOST,
    IMAP_PORT: config.IMAP_PORT.toString(),
    IMAP_SECURE: config.IMAP_SECURE.toString(),
    USER_NAME: config.USER_NAME,
    PASSWORD: config.PASSWORD,
    SENDER_NAME: config.SENDER_NAME,
    SENDER_EMAIL: config.SENDER_EMAIL,
    LAST_MESSAGES_NUM: config.LAST_MESSAGES_NUM.toString(),
  },
});
