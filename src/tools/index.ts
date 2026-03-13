import { standaloneTools } from "./standaloneTools";
import type { StandaloneTool } from "./standaloneTools";
import { mcpClients } from "./mcpClients";
import { ToolRouter } from "./ToolRouter";

export const toolRouter = new ToolRouter({
  mcpClients,
  standaloneTools: standaloneTools as StandaloneTool[],
});
