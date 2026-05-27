import * as path from "path";

import "dotenv/config";

import { logger } from "./logger";

const NOT_SET = "__NOT_SET__";

const getArrayValue = (envVar: string | undefined): Array<string> => {
  if (typeof envVar === "string") {
    return envVar
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  } else {
    return [];
  }
};

const resolvePath = (envVar: string | undefined): string | undefined => {
  return envVar ? path.resolve(envVar) : undefined;
};

export const config = {
  openaiModel: process.env.OPENAI_MODEL ?? NOT_SET,
  openaiBaseUrl: process.env.OPENAI_BASE_URL ?? NOT_SET,
  openaiApiKey: process.env.OPENAI_API_KEY ?? NOT_SET,

  filesystemAccessRoot:
    resolvePath(process.env.FILESYSTEM_ACCESS_ROOT) ?? NOT_SET,

  enabledTools: getArrayValue(process.env.ENABLED_TOOLS),
  enabledUnixTools: getArrayValue(process.env.ENABLED_UNIX_TOOLS),
  enabledMcps: getArrayValue(process.env.ENABLED_MCPS),
};

for (const [key, value] of Object.entries(config)) {
  if (value === NOT_SET) {
    logger.error(`Missing ${key} env variable`);
    process.exit(1);
  }
}
