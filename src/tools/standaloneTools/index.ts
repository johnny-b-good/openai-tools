export { StandaloneTool } from "./StandaloneTool";

import { datetime } from "./datetime";
import { ls } from "./ls";
import { getHomeDir } from "./getHomeDir";
import { fileDetect } from "./fileDetect";
import { runJavaScript } from "./runJavaScript";

export const standaloneTools = [
  datetime,
  ls,
  getHomeDir,
  fileDetect,
  runJavaScript,
];
