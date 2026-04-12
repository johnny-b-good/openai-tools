import { StandaloneTool } from "./StandaloneTool";

export const getHomeDir = new StandaloneTool({
  name: "getHomeDir",
  description: "Get the user's home directory path",
  toolFunction: () => {
    return process.env.HOME || process.env.USERPROFILE || "/";
  },
});
