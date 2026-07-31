export { MCPClient } from "./MCPClient";

import { chromeMcp } from "./chromeMcp";
import { filesystemMcp } from "./filesystemMcp";
import { tavilyMcp } from "./tavilyMcp";
import type { MCPClient } from "./MCPClient";

export const allMcpClients: Record<string, MCPClient> = {
  [chromeMcp.name]: chromeMcp,
  [filesystemMcp.name]: filesystemMcp,
  [tavilyMcp.name]: tavilyMcp,
};
