import type OpenAI from "openai";
import chalk from "chalk";

import { type MCPClient, allMcpClients } from "./mcpClients";
import { allStandaloneTools, type AllStandaloneTools } from "./standaloneTools";

type ToolProvider =
  | { type: "mcp"; client: MCPClient }
  | { type: "standalone"; tool: AllStandaloneTools };

export class ToolRouter {
  private mcpClients: Array<MCPClient>;
  private standaloneTools: Array<AllStandaloneTools>;
  private toolProviderMap: Map<string, ToolProvider> = new Map();

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
  }

  async connectAll() {
    await Promise.all(this.mcpClients.map((client) => client.connect()));

    this.toolsSchemas = this.mcpClients
      .map((client) => client.toolsSchemas)
      .flat();

    const displayedToolList: Array<{ provider: string; tools: Array<string> }> =
      [];

    displayedToolList.push({
      provider: "standalone",
      tools: this.standaloneTools.map((t) => t.name),
    });

    for (const tool of this.standaloneTools) {
      this.toolsSchemas.push(tool.toolSchema);
      this.toolProviderMap.set(tool.name, { type: "standalone", tool });
    }

    for (const client of this.mcpClients) {
      displayedToolList.push({
        provider: client.name,
        tools: client.toolNames,
      });
      for (const toolName of client.toolNames) {
        this.toolProviderMap.set(toolName, { type: "mcp", client });
      }
    }

    const formattedToolList = displayedToolList.map(
      ({ provider, tools }) => `- ${provider}: [${tools.join(", ")}]`,
    );

    console.log(
      chalk.grey(
        `○ ${chalk.bold("All enabled tools:")}\n${formattedToolList.join("\n")}`,
      ),
    );
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
