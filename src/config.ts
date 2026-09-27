import fs from "node:fs";

import "dotenv/config";
import { z } from "zod";

export const ConfigSchema = z.object({
  verbose: z.boolean(),
  userName: z.string(),
  agentName: z.string(),
  workingDirPath: z.string(),

  api: z.object({
    url: z.string(),
    model: z.string(),
    key: z.string(),
  }),

  promptPartsPaths: z.array(z.string()),

  tools: z.object({
    runPython: z
      .object({
        enabled: z.boolean(),
        dockerImageTag: z.string(),
      })
      .optional(),

    datetime: z
      .object({
        enabled: z.boolean(),
      })
      .optional(),

    sendNotification: z
      .object({
        enabled: z.boolean(),

        appName: z.string(),
        appDesktopEntry: z.string(),
        timeout: z.string(),
      })
      .optional(),

    readImageFile: z
      .object({
        enabled: z.boolean(),
      })
      .optional(),
  }),

  mcps: z.object({
    filesystem: z
      .object({
        enabled: z.boolean(),
      })
      .optional(),

    tavily: z
      .object({
        enabled: z.boolean(),

        tavilyApiKey: z.string(),
        proxyUrl: z.string(),
      })
      .optional(),

    fetch: z
      .object({
        enabled: z.boolean(),

        fileStoragePath: z.string(),
        browserType: z.enum(["chrome", "firefox"]),
        browserBinPath: z.string(),
        browserDataPath: z.string(),
      })
      .optional(),

    mail: z
      .object({
        enabled: z.boolean(),

        smtpHost: z.string(),
        smtpPort: z.number(),
        smtpSecure: z.boolean(),
        imapHost: z.string(),
        imapPort: z.number(),
        imapSecure: z.boolean(),
        userName: z.string(),
        password: z.string(),
        senderName: z.string(),
        senderEmail: z.string(),
        lastMessagesNum: z.number(),
      })
      .optional(),
  }),
});

export type Config = z.infer<typeof ConfigSchema>;

if (!process.env["AGENT_CONFIG_PATH"]) {
  console.error("Error: config file path not specified");
  process.exit(1);
}

let configFileRaw: string;
try {
  configFileRaw = fs.readFileSync(process.env["AGENT_CONFIG_PATH"], "utf-8");
} catch {
  console.error("Error: cannot read config file");
  process.exit(1);
}

let configObjRaw: unknown;
try {
  configObjRaw = JSON.parse(configFileRaw);
} catch {
  console.error("Error: cannot parse JSON in config file");
  process.exit(1);
}

const parsingResult = ConfigSchema.safeParse(configObjRaw);

if (!parsingResult.success) {
  console.error(
    "Error: invalid config file:\n",
    z.prettifyError(parsingResult.error),
  );
  process.exit(1);
}

export const config: Config = parsingResult.data;
