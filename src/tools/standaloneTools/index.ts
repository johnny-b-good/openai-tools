export { StandaloneTool } from "./StandaloneTool";


import { runPython } from "./runPython";

export type AllStandaloneTools =
  | typeof runPython;

export const allStandaloneTools: Record<string, AllStandaloneTools> = {
  [runPython.name]: runPython,
};
