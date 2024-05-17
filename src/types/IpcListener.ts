import { IpcMainInvokeEvent } from "electron";
import { LoggerMain } from "../implementations/LoggerMain";
import { LogLevel, LoggerRequest, TranslationRequest } from "@tser-framework/commons";
import { TranslatorRenderer } from "../implementations/TranslatorRenderer";

export interface IpcListener {
  type: "handle" | "on";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (e: IpcMainInvokeEvent, ...params: any) => unknown;
}

export const defaultIpcListeners: Record<string, IpcListener>={
  log: {
    type: 'on',
    fn: async (_, param: LoggerRequest): Promise<void> => {
      LoggerMain.log(LogLevel[param.level as keyof typeof LogLevel], 'renderer', param.msg);
    }
  },
  translate: {
    type: 'handle',
    fn: async (_, param: TranslationRequest): Promise<string> => {
      return TranslatorRenderer.translate(param.key, param.replacements);
    }
  }
}