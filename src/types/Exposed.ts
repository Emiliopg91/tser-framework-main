import {
  DefaulLevel,
  LoggerRequest,
  TranslationRequest,
} from "@tser-framework/commons";
import { ipcRenderer } from "electron";

export const defaultExposed = {
  api: {
    log(data: LoggerRequest): void {
      ipcRenderer.send("log", data);
    },
    translate(data: TranslationRequest): Promise<string> {
      return ipcRenderer.invoke("translate", data);
    },
    ping(): void {
      ipcRenderer.invoke("ping");
    },
  },
  env: {
    LOG_LEVEL: process.env.LOG_LEVEL || DefaulLevel,
  },
};
