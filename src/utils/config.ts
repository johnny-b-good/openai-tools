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
};

for (const [key, value] of Object.entries(config)) {
  if (value === NOT_SET) {
    logger.error(`Missing ${key} env variable`);
    process.exit(1);
  }
}
