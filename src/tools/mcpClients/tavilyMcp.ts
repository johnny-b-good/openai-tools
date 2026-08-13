import { MCPClient } from "./MCPClient";

import { config } from "../../utils";

export const tavilyMcp = new MCPClient({
  name: "tavily",
  command: "npx",
  args: ["-y", "tavily-mcp@latest"],
  env: {
    TAVILY_API_KEY: config.tavilyApiKey,
    HTTP_PROXY: config.proxyUrl,
    HTTPS_PROXY: config.proxyUrl,
  },
  allowedTools: ["tavily_search"],
});
