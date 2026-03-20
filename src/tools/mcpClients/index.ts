export { MCPClient } from "./MCPClient";

import { chromeMcp } from "./chromeMcp";
import { filesystemMcp } from "./filesystemMcp";

export const mcpClients = [chromeMcp, filesystemMcp];
