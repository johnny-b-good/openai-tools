import type { MCPClient } from "./MCPClient";
import { filesystemMcp } from "./filesystemMcp";
import { tavilyMcp } from "./tavilyMcp";
import { fetchMcp } from "./fetchMcp";
import { mailMcp } from "./mailMcp";
import { yandexMcp } from "./yandexMcp";

import { config } from "../../config";

export const allMcpClients: Record<string, MCPClient> = {};

if (config.mcps.filesystem?.enabled) {
  allMcpClients[filesystemMcp.name] = filesystemMcp;
}

if (config.mcps.tavily?.enabled) {
  allMcpClients[tavilyMcp.name] = tavilyMcp;
}

if (config.mcps.fetch?.enabled) {
  allMcpClients[fetchMcp.name] = fetchMcp;
}

if (config.mcps.mail?.enabled) {
  allMcpClients[mailMcp.name] = mailMcp;
}

if (config.mcps.yandex?.enabled) {
  allMcpClients[yandexMcp.name] = yandexMcp;
}

export { MCPClient } from "./MCPClient";
