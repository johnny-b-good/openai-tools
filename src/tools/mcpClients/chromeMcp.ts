import { MCPClient } from "./MCPClient";

export const chromeMcp = new MCPClient({
  name: "Chrome DevTools",
  command: "npx",
  args: [
    "-y",
    "chrome-devtools-mcp@latest",
    "--browser-url=http://127.0.0.1:9222",
  ],
});
