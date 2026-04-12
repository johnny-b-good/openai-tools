import { MCPClient } from "./MCPClient";

import { config } from "../../utils";

export const filesystemMcp = new MCPClient({
  name: "filesystem",
  command: "npx",
  args: [
    "-y",
    "@modelcontextprotocol/server-filesystem@latest",
    config.filesystemAccessRoot,
  ],
});
