import OpenAI from "openai";

import { config } from "./config";

export const openai = new OpenAI({
  baseURL: config.api.url,
  apiKey: config.api.key,
});
