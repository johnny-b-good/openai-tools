import OpenAI from "openai";

import { config } from "./utils";

export const openai = new OpenAI({
  baseURL: config.OPENAI_BASE_URL,
  apiKey: config.OPENAI_API_KEY,
});
