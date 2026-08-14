import { MCPClient } from "./MCPClient";

import { config } from "../../utils";

export const filesystemMcp = new MCPClient({
  name: "filesystem",
  command: "npx",
  args: [
    "-y",
    "@modelcontextprotocol/server-filesystem@latest",
    config.WORKING_DIRECTORY,
  ],
  allowedTools: [
    "read_text_file",
    "edit_file",
    "write_file",
    "create_directory",
    "list_directory",
    "list_directory_with_sizes",
    "move_file",
    "search_files",
    "get_file_info",
    "list_allowed_directories",
  ],
});
