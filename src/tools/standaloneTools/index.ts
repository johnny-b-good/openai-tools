export { StandaloneTool } from "./StandaloneTool";

import { runJavaScript } from "./runJavaScript";
import { runBashCommand } from "./runBashCommand";
import { runPython } from "./runPython";

export type AllStandaloneTools =
  | typeof runJavaScript
  | typeof runBashCommand
  | typeof runPython;

export const allStandaloneTools: Record<string, AllStandaloneTools> = {
  [runJavaScript.name]: runJavaScript,
  [runBashCommand.name]: runBashCommand,
  [runPython.name]: runPython,
};
