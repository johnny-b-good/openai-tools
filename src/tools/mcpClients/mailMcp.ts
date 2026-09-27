import { MCPClient } from "./MCPClient";

import { config } from "../../config";

export const mailMcp = new MCPClient({
  name: "mail",
  command: "npx",
  args: ["-y", "mail-mcp"],
  env: config.mcps.mail?.enabled
    ? {
        SMTP_HOST: config.mcps.mail.smtpHost,
        SMTP_PORT: config.mcps.mail.smtpPort.toString(),
        SMTP_SECURE: config.mcps.mail.smtpSecure.toString(),
        IMAP_HOST: config.mcps.mail.imapHost,
        IMAP_PORT: config.mcps.mail.imapPort.toString(),
        IMAP_SECURE: config.mcps.mail.imapSecure.toString(),
        USER_NAME: config.mcps.mail.userName,
        PASSWORD: config.mcps.mail.password,
        SENDER_NAME: config.mcps.mail.senderName,
        SENDER_EMAIL: config.mcps.mail.senderEmail,
        LAST_MESSAGES_NUM: config.mcps.mail.lastMessagesNum.toString(),
      }
    : undefined,
});
