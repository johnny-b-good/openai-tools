export { MCPClient } from "./MCPClient";

import { filesystemMcp } from "./filesystemMcp";
import { tavilyMcp } from "./tavilyMcp";
import type { MCPClient } from "./MCPClient";

export const allMcpClients: Record<string, MCPClient> = {
  [filesystemMcp.name]: filesystemMcp,
  [tavilyMcp.name]: tavilyMcp,
};
