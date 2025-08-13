import { datetime } from "./datetime";
import { ls } from "./ls";
import { getHomeDir } from "./getHomeDir";
import { fileDetect } from "./fileDetect";
import { javascriptInterpreter } from "./javascriptInterpreter";

export const allTools = {
  datetime,
  ls,
  getHomeDir,
  fileDetect,
  javascriptInterpreter,
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
  } else if (
    toolName === "javascriptInterpreter" &&
    javascriptInterpreter.checkArgs(args)
  ) {
    return javascriptInterpreter.function(args);
  } else {
    throw new Error("Unknown tool name or bad arguments");
  }
};

export const allToolSchemas = Object.values(allTools).map(
  (tool) => tool.schema,
);

export const allToolDescriptions = allToolSchemas
  .map((schema) => {
    const toolName = schema.function.name;
    const toolDescription = schema.function.description;
    return `- ${toolName} - ${toolDescription}`;
  })
  .join("\n\n");
