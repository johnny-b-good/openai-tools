import type OpenAI from "openai";

import { type MCPClient, allMcpClients } from "./mcpClients";
import { allStandaloneTools, type AllStandaloneTools } from "./standaloneTools";

type ToolProvider =
  | { type: "mcp"; client: MCPClient }
  | { type: "standalone"; tool: AllStandaloneTools };

export class ToolRouter {
  private mcpClients: Array<MCPClient>;
  private standaloneTools: Array<AllStandaloneTools>;
  private toolProviderMap: Map<string, ToolProvider> = new Map();

  public readonly enabledTools: Array<{
    provider: string;
    tools: Array<string>;
  }> = [];
  public readonly toolsSchemas: OpenAI.Chat.Completions.ChatCompletionFunctionTool[] =
    [];

  constructor() {
    this.mcpClients = Object.values(allMcpClients);
    this.standaloneTools = Object.values(allStandaloneTools);
  }

  async connectAll() {
    await Promise.all(this.mcpClients.map((client) => client.connect()));

    const standaloneToolNames: Array<string> = [];
    for (const tool of this.standaloneTools) {
      this.toolsSchemas.push(tool.toolSchema);
      this.toolProviderMap.set(tool.name, { type: "standalone", tool });
      standaloneToolNames.push(tool.name);
    }
    this.enabledTools.push({
      provider: "standalone",
      tools: standaloneToolNames,
    });

    for (const client of this.mcpClients) {
      for (const toolSchema of client.toolsSchemas) {
        this.toolsSchemas.push(toolSchema);
      }
      const toolNames: Array<string> = [];
      for (const toolName of client.toolNames) {
        toolNames.push(toolName);
        this.toolProviderMap.set(toolName, { type: "mcp", client });
      }
      this.enabledTools.push({ provider: client.name, tools: toolNames });
    }
  }

  async disconnectAll() {
    await Promise.all(this.mcpClients.map((client) => client.disconnect()));
  }

  async runTool(toolName: string, toolArgs: string): Promise<string> {
    const provider = this.toolProviderMap.get(toolName);

    if (!provider) {
      throw new Error(`Unknown tool provider for the tool "${toolName}"`);
    }

    if (provider.type === "mcp") {
      return await provider.client.runTool(toolName, toolArgs);
    } else {
      return await provider.tool.runTool(toolArgs);
    }
  }
}
