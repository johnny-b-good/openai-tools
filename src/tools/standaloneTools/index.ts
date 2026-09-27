export { StandaloneTool } from "./StandaloneTool";

import { runPython } from "./runPython";
import { datetime } from "./datetime";
import { sendNotification } from "./sendNotification";
import { readImageFile } from "./readImageFile";
import { config } from "../../config";

export type AllStandaloneTools =
  | typeof runPython
  | typeof datetime
  | typeof sendNotification
  | typeof readImageFile;

export const allStandaloneTools: Record<string, AllStandaloneTools> = {};

if (config.tools.runPython?.enabled) {
  allStandaloneTools[runPython.name] = runPython;
}

if (config.tools.datetime?.enabled) {
  allStandaloneTools[datetime.name] = datetime;
}

if (config.tools.sendNotification?.enabled) {
  allStandaloneTools[sendNotification.name] = sendNotification;
}

if (config.tools.readImageFile?.enabled) {
  allStandaloneTools[readImageFile.name] = readImageFile;
}
