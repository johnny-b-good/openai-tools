import type { MCPClient } from "./MCPClient";
import { filesystemMcp } from "./filesystemMcp";
import { tavilyMcp } from "./tavilyMcp";
import { fetchMcp } from "./fetchMcp";

export const allMcpClients: Record<string, MCPClient> = {
  [filesystemMcp.name]: filesystemMcp,
  [tavilyMcp.name]: tavilyMcp,
  [fetchMcp.name]: fetchMcp,
};

export { MCPClient } from "./MCPClient";
