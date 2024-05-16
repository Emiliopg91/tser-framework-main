import { IpcMainInvokeEvent } from "electron";
import { LoggerMain } from "../implementations/LoggerMain";
import { LogLevel, LoggerEventData } from "@tser-framework/commons";

export interface IpcListener {
  type: "handle" | "on";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (e: IpcMainInvokeEvent, ...params: any) => unknown;
}

export const defaultIpcListeners: Record<string, IpcListener>={
  log: {
    type: 'on',
    fn: async (_, param: LoggerEventData): Promise<void> => {
      LoggerMain.log(LogLevel[param.level as keyof typeof LogLevel], 'renderer', param.msg);
    }
  }
}