import { type ToolDescription } from "../types";

export const datetime: ToolDescription = {
  name: "datetime",
  description: "Get the current date and time in ISO format",
  toolFunction: () => {
    return new Date().toISOString();
  },
};
