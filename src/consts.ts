import OpenAI from "openai";

import { config } from "./utils";

export const openai = new OpenAI({
  baseURL: config.openaiBaseUrl,
  apiKey: config.openaiApiKey,
});
