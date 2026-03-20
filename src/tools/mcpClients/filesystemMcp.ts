import { MCPClient } from "./MCPClient";

import { config } from "../../utils";

export const filesystemMcp = new MCPClient({
  name: "Filesystem",
  command: "npx",
  args: [
    "-y",
    "@modelcontextprotocol/server-filesystem@latest",
    config.filesystemAccessRoot,
  ],
});
