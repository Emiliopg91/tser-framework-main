/* eslint-disable @typescript-eslint/no-explicit-any */
import { DefaulLevel, LogLevel, loggerArgsToString } from '@tser-framework/commons';
import { Mutex } from 'async-mutex';
import { LogLevel as ELogLevel } from 'electron-log';
import log from 'electron-log/main';
import path from 'path';

import { FileHelper } from './FileHelper';

declare module 'electron-log' {
  interface LogFunctions {
    system(...params: any[]): void;
  }
}
declare global {
  interface Console {
    logFile(): string;
    addTab(): void;
    removeTab(): void;
    system(...params: any[]): void;
  }
}

/**
 * Represents a logging utility for frontend.
 */
export class LoggerMain {
  private constructor() {}

  private static MUTEX: Mutex = new Mutex();

  public static LOG_FOLDER = path.join(FileHelper.APP_DIR, 'logs');
  private static OLD_FOLDER = path.join(LoggerMain.LOG_FOLDER, 'old');
  public static LOG_FILE = path.join(LoggerMain.LOG_FOLDER, 'application.log');

  /**
   * The current log level.
   */
  private static CURRENT_LEVEL = LogLevel.INFO;

  private static TABS = 0;

  /**
   * Initializes the LoggerMain.
   */
  public static async initialize(): Promise<void> {
    if (!FileHelper.exists(LoggerMain.LOG_FOLDER)) {
      FileHelper.mkdir(LoggerMain.LOG_FOLDER, true);
    }
    if (!FileHelper.exists(LoggerMain.OLD_FOLDER)) {
      FileHelper.mkdir(LoggerMain.OLD_FOLDER, true);
    }

    console.log('Logger writing to file ' + LoggerMain.LOG_FILE);

    const level: string = process.env.LOG_LEVEL || DefaulLevel;
    LoggerMain.CURRENT_LEVEL = LogLevel[level as keyof typeof LogLevel];

    log.addLevel('system', 2);
    log.default.scope.defaultLabel = 'electron';

    log.transports.file.resolvePathFn = (): string => LoggerMain.LOG_FILE;
    log.transports.file.level = LogLevel[LoggerMain.CURRENT_LEVEL].toLowerCase() as ELogLevel;
    log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} > {text}';

    log.transports.console.level = LogLevel[LoggerMain.CURRENT_LEVEL].toLowerCase() as ELogLevel;
    log.transports.console.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} > {text}';

    console.logFile = (): string => {
      return LoggerMain.LOG_FILE;
    };
    console.addTab = LoggerMain.addTab;
    console.removeTab = LoggerMain.removeTab;
    console.debug = LoggerMain.debug;
    console.info = LoggerMain.info;
    console.log = LoggerMain.info;
    console.warn = LoggerMain.warn;
    console.error = LoggerMain.error;
    console.system = LoggerMain.system;
  }

  public static addTab(): void {
    LoggerMain.MUTEX.acquire().then((release) => {
      LoggerMain.TABS++;
      release();
    });
  }

  public static removeTab(): void {
    LoggerMain.MUTEX.acquire().then((release) => {
      LoggerMain.TABS--;
      release();
    });
  }

  /**
   * Logs a message.
   * @param lvl - The log level.
   * @param args - The message arguments.
   */
  public static log(lvl: LogLevel, category: string, ...args: any): void {
    LoggerMain.MUTEX.acquire().then((release) => {
      LoggerMain.archiveLogFile().then(async () => {
        if (LoggerMain.isLevelEnabled(lvl)) {
          const tabs = ''.padEnd(2 * LoggerMain.TABS, ' ');
          const logEntry = `${tabs}${loggerArgsToString(...args)}`;
          const logger = log.scope(category.padEnd(8, ' '));
          switch (lvl) {
            case LogLevel.DEBUG:
              logger.debug(logEntry);
              break;
            case LogLevel.INFO:
              logger.info(logEntry);
              break;
            case LogLevel.SYSTEM:
              logger.system(logEntry);
              break;
            case LogLevel.WARN:
              logger.warn(logEntry);
              break;
            case LogLevel.ERROR:
              logger.error(logEntry);
              break;
          }
        }
        release();
      });
    });
  }

  private static archiveLogFile(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (FileHelper.exists(LoggerMain.LOG_FILE)) {
        const fileDate = new Date(FileHelper.getLastModified(LoggerMain.LOG_FILE));
        const now = new Date();

        if (fileDate.getDate() != now.getDate()) {
          const zipFile = path.join(
            LoggerMain.OLD_FOLDER,
            'application-' +
              fileDate.getFullYear() +
              '-' +
              String(fileDate.getMonth() + 1).padStart(2, '0') +
              '-' +
              String(fileDate.getDate()).padStart(2, '0') +
              '.zip'
          );
          FileHelper.zipFiles(zipFile, LoggerMain.LOG_FILE)
            .then(() => {
              FileHelper.delete(LoggerMain.LOG_FILE);
              FileHelper.append(LoggerMain.LOG_FILE, 'Rotated log file to ' + zipFile + '\n');
              LoggerMain.info('Rotated log file to ' + zipFile);
              resolve();
            })
            .catch(() => {
              resolve();
            });
        } else {
          resolve();
        }
      } else {
        resolve();
      }
    });
  }

  /**
   * Checks if a log level is enabled.
   * @param lvl - The log level.
   * @returns True if the log level is enabled, otherwise false.
   */
  private static isLevelEnabled(lvl: LogLevel): boolean {
    return LoggerMain.CURRENT_LEVEL <= lvl;
  }

  /**
   * Logs a debug message.
   * @param args - The message arguments.
   */
  public static debug(...args: any): void {
    LoggerMain.log(LogLevel.DEBUG, 'main', ...args);
  }

  /**
   * Logs an info message.
   * @param args - The message arguments.
   */
  public static info(...args: any): void {
    LoggerMain.log(LogLevel.INFO, 'main', ...args);
  }

  /**
   * Logs a system message.
   * @param args - The message arguments.
   */
  public static system(...args: any): void {
    LoggerMain.log(LogLevel.SYSTEM, 'main', ...args);
  }

  /**
   * Logs a warning message.
   * @param args - The message arguments.
   */
  public static warn(...args: any): void {
    LoggerMain.log(LogLevel.WARN, 'main', ...args);
  }

  /**
   * Logs an error message.
   * @param args - The message arguments.
   */
  public static error(...args: any): void {
    LoggerMain.log(LogLevel.ERROR, 'main', ...args);
  }
}
