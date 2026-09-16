export { StandaloneTool } from "./StandaloneTool";

import { runPython } from "./runPython";
import { datetime } from "./datetime";
import { sendNotification } from "./sendNotification.ts";

export type AllStandaloneTools =
  typeof runPython | typeof datetime | typeof sendNotification;

export const allStandaloneTools: Record<string, AllStandaloneTools> = {
  [runPython.name]: runPython,
  [datetime.name]: datetime,
  [sendNotification.name]: sendNotification,
};
