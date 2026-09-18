export { StandaloneTool } from "./StandaloneTool";

import { runPython } from "./runPython";
import { datetime } from "./datetime";
import { sendNotification } from "./sendNotification";
import { readImageFile } from "./readImageFile";

export type AllStandaloneTools =
  | typeof runPython
  | typeof datetime
  | typeof sendNotification
  | typeof readImageFile;

export const allStandaloneTools: Record<string, AllStandaloneTools> = {
  [runPython.name]: runPython,
  [datetime.name]: datetime,
  [sendNotification.name]: sendNotification,
  [readImageFile.name]: readImageFile,
};
