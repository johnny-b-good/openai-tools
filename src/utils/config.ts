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

export const config = {
  openaiModel: process.env.OPENAI_MODEL ?? NOT_SET,
  openaiBaseUrl: process.env.OPENAI_BASE_URL ?? NOT_SET,
  openaiApiKey: process.env.OPENAI_API_KEY ?? NOT_SET,

  enabledTools: getArrayValue(process.env.ENABLED_TOOLS),
  enabledMcps: getArrayValue(process.env.ENABLED_MCPS),

  filesystemAccessRoot: process.env.FILESYSTEM_ACCESS_ROOT ?? NOT_SET,
  pythonDockerImageTag: process.env.PYTHON_DOCKER_IMAGE_TAG ?? NOT_SET,
  tavilyApiKey: process.env.TAVILY_API_KEY ?? NOT_SET,
  proxyUrl: process.env.PROXY_URL ?? NOT_SET,

  ADVANCED_FETCH_FILE_STORAGE_PATH:
    process.env.ADVANCED_FETCH_FILE_STORAGE_PATH ?? NOT_SET,
  ADVANCED_FETCH_BROWSER_TYPE:
    process.env.ADVANCED_FETCH_BROWSER_TYPE ?? NOT_SET,
  ADVANCED_FETCH_BROWSER_BIN_PATH:
    process.env.ADVANCED_FETCH_BROWSER_BIN_PATH ?? NOT_SET,
  ADVANCED_FETCH_BROWSER_DATA_PATH:
    process.env.ADVANCED_FETCH_BROWSER_DATA_PATH ?? NOT_SET,
};

for (const [key, value] of Object.entries(config)) {
  if (value === NOT_SET) {
    logger.error(`Missing ${key} env variable`);
    process.exit(1);
  }
}
