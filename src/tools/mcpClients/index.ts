import type { MCPClient } from "./MCPClient";
import { filesystemMcp } from "./filesystemMcp";
import { tavilyMcp } from "./tavilyMcp";
import { fetchMcp } from "./fetchMcp";
import { mailMcp } from "./mailMcp.ts";

export const allMcpClients: Record<string, MCPClient> = {
  [filesystemMcp.name]: filesystemMcp,
  [tavilyMcp.name]: tavilyMcp,
  [fetchMcp.name]: fetchMcp,
  [mailMcp.name]: mailMcp,
};

export { MCPClient } from "./MCPClient";
