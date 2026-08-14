import { MCPClient } from "./MCPClient";

import { config } from "../../utils";

export const tavilyMcp = new MCPClient({
  name: "tavily",
  command: "npx",
  args: ["-y", "tavily-mcp@latest"],
  env: {
    TAVILY_API_KEY: config.TAVILY_API_KEY,
    HTTP_PROXY: config.PROXY_URL,
    HTTPS_PROXY: config.PROXY_URL,
  },
  allowedTools: ["tavily_search"],
});
