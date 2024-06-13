/* eslint-disable @typescript-eslint/no-empty-function */

/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { UpdateDownloadedEvent, autoUpdater } from 'electron-updater';

import { DateUtils } from './DateUtils';
import { LoggerMain } from './LoggerMain';

export class AppUpdater {
  private static LOGGER = new LoggerMain('AppUpdater');
  private downloadStartTime: number | undefined = undefined;

  public constructor(
    checkInterval = 24 * 60 * 60 * 1000,
    callback?: (event: UpdateDownloadedEvent) => void
  ) {
    autoUpdater.logger = {
      info(..._args: any): void {},
      warn(..._args: any): void {},
      error(..._args: any): void {}
    };
    autoUpdater.autoDownload = true;
    autoUpdater.disableWebInstaller = true;
    autoUpdater.forceDevUpdateConfig = true;
    autoUpdater.disableDifferentialDownload = true;

    autoUpdater.on('checking-for-update', (): void => {
      AppUpdater.LOGGER.info('Checking for update');
    });

    autoUpdater.on('update-not-available', (): void => {
      setTimeout(async () => {
        await autoUpdater.checkForUpdates();
      }, checkInterval);
      AppUpdater.LOGGER.system('No updates found');
      AppUpdater.LOGGER.system(
        'Next update check: ' +
          DateUtils.dateToFormattedString(new Date(new Date().getTime() + checkInterval))
      );
    });

    autoUpdater.on('update-available', (info): void => {
      this.downloadStartTime = Date.now();
      AppUpdater.LOGGER.system('Available ' + info.version + ' update, starting download');
    });

    autoUpdater.on('update-downloaded', (info: UpdateDownloadedEvent): void => {
      const timeDif = Date.now() - (this.downloadStartTime as number);

      this.downloadStartTime = undefined;
      AppUpdater.LOGGER.system(
        'Downloaded to ' + info.downloadedFile + 'in ' + Math.round(timeDif / 1000)
      );
      if (callback) {
        callback(info);
      }
    });

    autoUpdater.checkForUpdates();
  }

  public quitAndInstall(isSilent?: boolean, isForceRunAfter?: boolean): void {
    autoUpdater.quitAndInstall(isSilent, isForceRunAfter);
  }
}
