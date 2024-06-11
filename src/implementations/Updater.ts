import { autoUpdater } from 'electron-updater';
import { AppUpdaterEvents } from 'electron-updater/out/AppUpdater';

import { LoggerMain } from './LoggerMain';

export class AppUpdater {
  constructor() {
    autoUpdater.logger = new LoggerMain('AppUpdater');
    autoUpdater.autoDownload = true;
    autoUpdater.disableWebInstaller = true;
    autoUpdater.forceDevUpdateConfig = true;
    autoUpdater.disableDifferentialDownload = true;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public on(event: keyof AppUpdaterEvents, callback: (...args: any) => void): void {
    autoUpdater.on(event, callback);
  }
}
