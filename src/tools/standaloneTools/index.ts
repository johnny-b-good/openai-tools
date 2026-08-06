export { StandaloneTool } from "./StandaloneTool";

import { runPython } from "./runPython";
import { datetime } from "./datetime";

export type AllStandaloneTools = typeof runPython | typeof datetime;

export const allStandaloneTools: Record<string, AllStandaloneTools> = {
  [runPython.name]: runPython,
  [datetime.name]: datetime,
};
