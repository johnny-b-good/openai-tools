import { type ToolDescription } from "../types";

export const getHomeDir: ToolDescription = {
  name: "getHomeDir",
  description: "Get the user's home directory path",
  toolFunction: () => {
    return process.env.HOME || process.env.USERPROFILE || "/";
  },
};
