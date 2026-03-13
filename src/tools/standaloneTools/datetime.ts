import { StandaloneTool } from "./StandaloneTool";

export const datetime = new StandaloneTool({
  name: "datetime",
  description: "Get the current date and time in ISO format",
  toolFunction: () => {
    return new Date().toISOString();
  },
});
