import { MCPClient } from "./MCPClient";

import { config } from "../../config";

export const fetchMcp = new MCPClient({
  name: "fetch",
  command: "npx",
  args: ["-y", "advanced-fetch-mcp"],
  env: config.mcps.fetch?.enabled
    ? {
        FILE_STORAGE_PATH: config.mcps.fetch.fileStoragePath,
        BROWSER_TYPE: config.mcps.fetch.browserType,
        BROWSER_BIN_PATH: config.mcps.fetch.browserBinPath,
        BROWSER_DATA_PATH: config.mcps.fetch.browserDataPath,

        // Forward display-related system env vars
        DISPLAY: process.env["DISPLAY"] ?? "",
        WAYLAND_DISPLAY: process.env["WAYLAND_DISPLAY"] ?? "",
        XDG_RUNTIME_DIR: process.env["XDG_RUNTIME_DIR"] ?? "",
      }
    : undefined,
});
