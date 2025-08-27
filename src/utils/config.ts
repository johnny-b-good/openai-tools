import "dotenv/config";

import { logger } from "./logger";

export const config = {
  openaiModel: process.env.OPENAI_MODEL ?? "__NULL__",
  openaiEmbeddingModel: process.env.OPENAI_EMBEDDING_MODEL ?? "__NULL__",
  openaiBaseUrl: process.env.OPENAI_BASE_URL ?? "__NULL__",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "__NULL__",
  googleApiKey: process.env.GOOGLE_API_KEY ?? "__NULL__",
  googleCustomSearchId: process.env.GOOGLE_CUSTOM_SEARCH_ID ?? "__NULL__",
};

for (const [key, value] of Object.entries(config)) {
  if (value === "__NULL__") {
    logger.error(`Missing ${key} env variable`);
    process.exit(1);
  }
}
