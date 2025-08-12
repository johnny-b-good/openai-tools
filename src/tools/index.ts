import { datetime } from "./datetime";
import { ls } from "./ls";
import { getHomeDir } from "./getHomeDir";
import { fileDetect } from "./fileDetect";
import { calculator } from "./calculator";

export const allTools = {
  datetime,
  ls,
  getHomeDir,
  fileDetect,
  calculator,
};

export const makeAToolCall = (
  toolName: string,
  args: {
    [key: string]: unknown;
  },
) => {
  if (toolName === "datetime" && datetime.checkArgs(args)) {
    return datetime.function(args);
  } else if (toolName === "ls" && ls.checkArgs(args)) {
    return ls.function(args);
  } else if (toolName === "getHomeDir" && getHomeDir.checkArgs(args)) {
    return getHomeDir.function(args);
  } else if (toolName === "fileDetect" && fileDetect.checkArgs(args)) {
    return fileDetect.function(args);
  } else if (toolName === "calculator" && calculator.checkArgs(args)) {
    return calculator.function(args);
  } else {
    throw new Error("Unknown tool name or bad arguments");
  }
};

export const allToolDescriptions = Object.values(allTools).map(
  (tool) => tool.schema,
);

export const allToolDescriptionsString = allToolDescriptions
  .map((tool) => {
    const toolName = tool.name;
    const toolDescription = tool.description!;
    return `${toolName} - ${toolDescription}`;
  })
  .join("\n\n");
