import { IpcMainInvokeEvent } from 'electron';
export interface IpcListener {
    type: 'handle' | 'on';
    fn: (e: IpcMainInvokeEvent, ...params: any) => unknown;
}
