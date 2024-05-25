import { IpcMainInvokeEvent } from "electron";
import { LoggerMain } from "../implementations/LoggerMain";
import {
  JsonUtils,
  LogLevel,
  LoggerRequest,
  RestClientRequest,
  RestClientResponse,
} from "@tser-framework/commons";
import { RestClientMain } from "../implementations/RestClientMain";
import { ConfigurationHelper } from "../implementations/ConfigurationHelper";

export interface IpcListener {
  sync: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (e: IpcMainInvokeEvent, ...params: any) => unknown;
}

export const defaultIpcListeners: Record<string, IpcListener> = {
  log: {
    sync: false,
    fn(_: IpcMainInvokeEvent, param: LoggerRequest) {
      LoggerMain.log(
        LogLevel[param.level as keyof typeof LogLevel],
        "renderer",
        param.msg
      );
    },
  },
  rest: {
    sync: true,
    fn<T>(
      _: IpcMainInvokeEvent,
      request: RestClientRequest<T>
    ): Promise<RestClientResponse<T>> {
      return RestClientMain.invoke(request);
    },
  },
  cfg: {
    sync: true,
    fn(): Record<string, any> {
      return JsonUtils.modifyObject(
        ConfigurationHelper.config(),
        "*",
        (_: string, value: unknown) => {
          if (String(value).startsWith("{enc}")) {
            return "<secret value>";
          }
          return value;
        }
      );
    },
  },
};
