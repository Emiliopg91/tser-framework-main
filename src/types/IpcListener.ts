import { IpcMainInvokeEvent, ipcRenderer } from "electron";
import { LoggerMain } from "../implementations/LoggerMain";
import {
  LogLevel,
  LoggerRequest,
  TranslationRequest,
} from "@tser-framework/commons";
import { TranslatorMain } from "../implementations/TranslatorMain";

export interface IpcListener {
  type: "handle" | "on";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (e: IpcMainInvokeEvent, ...params: any) => unknown;
}

export const defaultIpcListeners: Record<string, IpcListener> = {
  log: {
    type: "on",
    fn: async (_, param: LoggerRequest): Promise<void> => {
      LoggerMain.log(
        LogLevel[param.level as keyof typeof LogLevel],
        "renderer",
        param.msg
      );
    },
  },
  translate: {
    type: "handle",
    fn: async (_, param: TranslationRequest): Promise<string> => {
      return TranslatorMain.translate(param.key, param.replacements);
    },
  },
};

export const defaultExposedApi = {
  log(data: LoggerRequest): void {
    ipcRenderer.send("log", data);
  },
  translate(data: TranslationRequest): string {
    return TranslatorMain.translate(data.key, data.replacements);
  },
};
