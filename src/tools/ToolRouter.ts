import type OpenAI from "openai";

import { type MCPClient, allMcpClients } from "./mcpClients";
import { allStandaloneTools, type AllStandaloneTools } from "./standaloneTools";
import { logger } from "../utils";

export class ToolRouter {
  private mcpClients: Array<MCPClient>;
  private standaloneTools: Array<AllStandaloneTools>;

  toolsSchemas: OpenAI.Chat.Completions.ChatCompletionFunctionTool[] = [];

  constructor({
    enabledMcps,
    enabledTools,
  }: {
    enabledMcps: Array<string>;
    enabledTools: Array<string>;
  }) {
    this.mcpClients = [];
    for (const enabledMcp of enabledMcps) {
      const mcp = allMcpClients[enabledMcp];
      if (mcp) {
        this.mcpClients.push(mcp);
      } else {
        throw new Error(`Unknown MCP "${enabledMcp}"`);
      }
    }

    this.standaloneTools = [];
    for (const enabledTool of enabledTools) {
      const tool = allStandaloneTools[enabledTool];
      if (tool) {
        this.standaloneTools.push(tool);
      } else {
        throw new Error(`Unknown tool "${enabledTool}"`);
      }
    }

    logger.info(
      `Enabled MCP clients: ${enabledMcps.length > 0 ? enabledMcps.join(", ") : "<NONE>"}`,
    );
    logger.info(
      `Enabled tools: ${enabledTools.length > 0 ? enabledTools.join(", ") : "<NONE>"}`,
    );
  }

  async connectAll() {
    await Promise.all(this.mcpClients.map((client) => client.connect()));

    this.toolsSchemas = this.mcpClients
      .map((client) => client.toolsSchemas)
      .flat();

    for (const tool of this.standaloneTools) {
      this.toolsSchemas.push(tool.toolSchema);
    }
  }

  async disconnectAll() {
    await Promise.all(this.mcpClients.map((client) => client.disconnect()));
  }

  async runTool(toolName: string, toolArgs: string): Promise<string> {
    for (const client of this.mcpClients) {
      if (client.toolNames.includes(toolName)) {
        return await client.runTool(toolName, toolArgs);
      }
    }

    for (const tool of this.standaloneTools) {
      if (tool.name === toolName) {
        return await tool.runTool(toolArgs);
      }
    }

    throw new Error(`Unknown tool provider for the tool "${toolName}"`);
  }
}
