import { MCPClient } from "./MCPClient";

import { config } from "../../utils";

export const fetchMcp = new MCPClient({
  name: "fetch",
  command: "npx",
  args: ["-y", "advanced-fetch-mcp"],
  env: {
    FILE_STORAGE_PATH: config.ADVANCED_FETCH_FILE_STORAGE_PATH,
    BROWSER_TYPE: config.ADVANCED_FETCH_BROWSER_TYPE,
    BROWSER_BIN_PATH: config.ADVANCED_FETCH_BROWSER_BIN_PATH,
    BROWSER_DATA_PATH: config.ADVANCED_FETCH_BROWSER_DATA_PATH,

    DISPLAY: process.env["DISPLAY"] ?? "",
    WAYLAND_DISPLAY: process.env["WAYLAND_DISPLAY"] ?? "",
    XDG_RUNTIME_DIR: process.env["XDG_RUNTIME_DIR"] ?? "",
  },
});
