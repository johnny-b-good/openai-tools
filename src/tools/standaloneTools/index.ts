export { StandaloneTool } from "./StandaloneTool";

import { datetime } from "./datetime";
import { ls } from "./ls";
import { getHomeDir } from "./getHomeDir";
import { fileDetect } from "./fileDetect";
import { runJavaScript } from "./runJavaScript";
import { runBashCommand } from "./runBashCommand";

export type AllStandaloneTools =
  | typeof datetime
  | typeof ls
  | typeof getHomeDir
  | typeof fileDetect
  | typeof runJavaScript
  | typeof runBashCommand;

export const allStandaloneTools: Record<string, AllStandaloneTools> = {
  [datetime.name]: datetime,
  [ls.name]: ls,
  [getHomeDir.name]: getHomeDir,
  [fileDetect.name]: fileDetect,
  [runJavaScript.name]: runJavaScript,
  [runBashCommand.name]: runBashCommand,
};
