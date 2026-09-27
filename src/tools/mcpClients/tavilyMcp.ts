import { MCPClient } from "./MCPClient";

import { config } from "../../config";

export const tavilyMcp = new MCPClient({
  name: "tavily",
  command: "npx",
  args: ["-y", "tavily-mcp@latest"],
  env: config.mcps.tavily?.enabled
    ? {
        TAVILY_API_KEY: config.mcps.tavily.tavilyApiKey,
        HTTP_PROXY: config.mcps.tavily.proxyUrl,
        HTTPS_PROXY: config.mcps.tavily.proxyUrl,
      }
    : undefined,
  allowedTools: ["tavily_search", "tavily_extract"],
});
