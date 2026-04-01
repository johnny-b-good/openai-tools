import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type OpenAI from "openai";

export class MCPClient {
  name: string;
  toolsSchemas: OpenAI.Chat.Completions.ChatCompletionFunctionTool[] = [];
  toolNames: Array<string> = [];

  private command: string;
  private args: Array<string>;
  private mcp: Client;
  private transport: StdioClientTransport | null = null;

  constructor({
    name,
    command,
    args,
  }: {
    name: string;
    command: string;
    args: Array<string>;
  }) {
    this.name = name;
    this.command = command;
    this.args = args;
    this.mcp = new Client({
      name: "mcp-client-cli",
      version: "1.0.0",
    });
  }

  async connect() {
    try {
      this.transport = new StdioClientTransport({
        command: this.command,
        args: this.args,
      });

      await this.mcp.connect(this.transport);

      const toolsResult = await this.mcp.listTools();

      this.toolsSchemas = toolsResult.tools.map((tool) => {
        return {
          type: "function",
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.inputSchema,
          },
        };
      });

      this.toolNames = toolsResult.tools.map((tool) => tool.name);
    } catch {
      throw new Error(`Failed to connect to MCP server ${this.name}`);
    }
  }

  async runTool(toolName: string, toolArgs: string): Promise<string> {
    let parsedToolArgs;
    try {
      parsedToolArgs = JSON.parse(toolArgs);
    } catch {
      throw new Error("Malformed tool arguments");
    }

    const result = await this.mcp.callTool({
      name: toolName,
      arguments: parsedToolArgs,
    });

    return result.content as string;
  }

  async disconnect() {
    await this.mcp.close();
  }
}
