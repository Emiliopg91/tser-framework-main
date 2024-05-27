import {
  JsonUtils,
  LogLevel,
  LoggerRequest,
  RestClientRequest,
  RestClientResponse
} from '@tser-framework/commons';
import { IpcMainInvokeEvent } from 'electron';
import { ConfigurationHelper } from '../implementations/ConfigurationHelper';
import { LoggerMain } from '../implementations/LoggerMain';
import { RestClientMain } from '../implementations/RestClientMain';

export interface IpcListener {
  sync: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (e: IpcMainInvokeEvent, ...params: any) => unknown;
}

export const defaultIpcListeners: Record<string, IpcListener> = {
  log: {
    sync: false,
    fn(_: IpcMainInvokeEvent, param: LoggerRequest) {
      LoggerMain.log(LogLevel[param.level as keyof typeof LogLevel], 'renderer', param.msg);
    }
  },
  rest: {
    sync: true,
    fn<T>(_: IpcMainInvokeEvent, request: RestClientRequest<T>): Promise<RestClientResponse<T>> {
      return RestClientMain.invoke(request);
    }
  },
  cfg: {
    sync: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fn(): Record<string, any> {
      const cfg = JSON.parse(JSON.stringify(ConfigurationHelper.config()));
      return JsonUtils.modifyObject(cfg, '*', (_: string, value: unknown) => {
        if (String(value).startsWith('{enc}')) {
          return '<secret value>';
        }
        return value;
      });
    }
  }
};
