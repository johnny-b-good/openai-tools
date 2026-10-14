import { MCPClient } from "./MCPClient";

import { config } from "../../config";

export const yandexMcp = new MCPClient({
  name: "yandex",
  command: "uv",
  args: ["run", "yasha.py"],
  cwd: "/home/anton/dev/yasha", // TODO: config!
  env: config.mcps.yandex?.enabled
    ? {
        API_KEY: config.mcps.yandex.apiKey,
        FOLDER_ID: config.mcps.yandex.folderId,
      }
    : undefined,
  allowedTools: ["yandex_web_search"],
});
