import type OpenAI from "openai";

import type { MCPClient } from "./mcpClients";
import type { StandaloneTool } from "./standaloneTools";

export class ToolRouter {
  private mcpClients: Array<MCPClient>;
  private standaloneTools: Array<StandaloneTool>;

  toolsSchemas: OpenAI.Chat.Completions.ChatCompletionFunctionTool[] = [];

  constructor({
    mcpClients,
    standaloneTools,
  }: {
    mcpClients: Array<MCPClient>;
    standaloneTools: Array<StandaloneTool>;
  }) {
    this.mcpClients = mcpClients;
    this.standaloneTools = standaloneTools;
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
