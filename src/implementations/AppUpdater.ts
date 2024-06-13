/* eslint-disable @typescript-eslint/no-empty-function */

/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Mutex } from 'async-mutex';
import { UpdateDownloadedEvent, autoUpdater } from 'electron-updater';

import { DateUtils } from './DateUtils';
import { File } from './File';
import { LoggerMain } from './LoggerMain';

export class AppUpdater {
  private static MUTEX = new Mutex();
  private static LOGGER = new LoggerMain('AppUpdater');
  private downloadStartTime: number | undefined = undefined;

  private getDownloadStartTime(): number {
    return this.downloadStartTime as number;
  }

  private setDownloadStartTime(): void {
    this.downloadStartTime = Date.now();
  }

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
      AppUpdater.MUTEX.acquire().then((release) => {
        this.setDownloadStartTime;
        AppUpdater.LOGGER.system('Available ' + info.version + ' update, starting download');

        release();
      });
    });

    autoUpdater.on('update-downloaded', (info: UpdateDownloadedEvent): void => {
      AppUpdater.MUTEX.acquire().then((release) => {
        const timeDif = Math.round(Date.now() - (this.getDownloadStartTime() as number) / 1000);

        AppUpdater.LOGGER.system('Update downloaded to ' + info.downloadedFile);
        AppUpdater.LOGGER.system(
          'Transfered ' +
            this.humanFileSize(new File({ file: info.downloadedFile }).getSize()) +
            ' in ' +
            timeDif +
            ' seconds (' +
            this.humanFileSize(new File({ file: info.downloadedFile }).getSize() / timeDif) +
            '/s)'
        );
        if (callback) {
          callback(info);
        }

        release();
      });
    });

    autoUpdater.checkForUpdates();
  }

  public quitAndInstall(isSilent?: boolean, isForceRunAfter?: boolean): void {
    autoUpdater.quitAndInstall(isSilent, isForceRunAfter);
  }

  private humanFileSize(bytes: number, si = false, dp = 1): string {
    const thresh = si ? 1000 : 1024;

    if (Math.abs(bytes) < thresh) {
      return bytes + ' B';
    }

    const units = si
      ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
      : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10 ** dp;

    do {
      bytes /= thresh;
      ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

    return bytes.toFixed(dp) + ' ' + units[u];
  }
}
