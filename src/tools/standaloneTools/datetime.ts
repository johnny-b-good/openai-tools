import { StandaloneTool } from "./StandaloneTool";

export const datetime = new StandaloneTool({
  name: "datetime",
  description: "Get the current date and time in the ISO format",
  toolFunction: () => {
    return new Date().toISOString();
  },
});
