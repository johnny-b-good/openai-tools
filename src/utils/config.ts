import "dotenv/config";

import { logger } from "./logger";

const NOT_SET = "__NOT_SET__";

export const config = {
  openaiModel: process.env.OPENAI_MODEL ?? NOT_SET,
  openaiBaseUrl: process.env.OPENAI_BASE_URL ?? NOT_SET,
  openaiApiKey: process.env.OPENAI_API_KEY ?? NOT_SET,
};

for (const [key, value] of Object.entries(config)) {
  if (value === NOT_SET) {
    logger.error(`Missing ${key} env variable`);
    process.exit(1);
  }
}
