/* eslint-disable @typescript-eslint/no-explicit-any */
import { DefaulLevel, LogLevel, loggerArgsToString } from '@tser-framework/commons';
import { Mutex } from 'async-mutex';
import path from 'path';

import { File } from './File';
import { FileHelper } from './FileHelper';

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
  constructor(label: string) {
    this.category = label;
  }

  private static CONSOLE_LOG = console.log;

  private static MUTEX: Mutex = new Mutex();

  public static LOG_FOLDER = path.join(FileHelper.APP_DIR, 'logs');
  private static OLD_FOLDER = path.join(LoggerMain.LOG_FOLDER, 'old');
  public static LOG_FILE = path.join(LoggerMain.LOG_FOLDER, 'application.log');

  /**
   * The current log level.
   */
  private static CURRENT_LEVEL = LogLevel.INFO;

  private static TABS = 0;

  private category: string;

  /**
   * Initializes the LoggerMain.
   */
  public static async initialize(): Promise<void> {
    if (!new File({ file: LoggerMain.LOG_FOLDER }).exists()) {
      new File({ file: LoggerMain.LOG_FOLDER }).mkdir;
    }
    if (!new File({ file: LoggerMain.OLD_FOLDER }).exists()) {
      new File({ file: LoggerMain.OLD_FOLDER }).mkdir();
    }

    console.log('Logger writing to file ' + LoggerMain.LOG_FILE);

    const level: string = process.env.LOG_LEVEL || DefaulLevel;
    LoggerMain.CURRENT_LEVEL = LogLevel[level as keyof typeof LogLevel];

    console.logFile = (): string => {
      return LoggerMain.LOG_FILE;
    };

    const logger = new LoggerMain('console');
    console.addTab = LoggerMain.addTab;
    console.removeTab = LoggerMain.removeTab;
    console.debug = logger.debug;
    console.info = logger.info;
    console.log = logger.info;
    console.warn = logger.warn;
    console.error = logger.error;
    console.system = logger.system;
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
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const hh = String(today.getHours()).padStart(2, '0');
    const MM = String(today.getMinutes()).padStart(2, '0');
    const ss = String(today.getSeconds()).padStart(2, '0');
    const sss = String(today.getMilliseconds()).padEnd(3, '0');
    const date = `${mm}/${dd}/${yyyy} ${hh}:${MM}:${ss}.${sss}`;

    LoggerMain.MUTEX.acquire().then((release) => {
      LoggerMain.archiveLogFile().then(() => {
        if (LoggerMain.isLevelEnabled(lvl)) {
          const tabs = ''.padEnd(2 * LoggerMain.TABS, ' ');
          const logEntry = `[${date}][${LogLevel[lvl].padEnd(
            6,
            ' '
          )}] (${category.padEnd(20, ' ')}) - ${tabs}${loggerArgsToString(...args)}`;
          FileHelper.append(LoggerMain.LOG_FILE, logEntry + '\n');
          LoggerMain.CONSOLE_LOG(logEntry);
        }
        release();
      });
    });
  }

  private static archiveLogFile(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (new File({ file: LoggerMain.LOG_FILE }).exists()) {
        const fileDate = new Date(new File({ file: LoggerMain.LOG_FILE }).getLastModified());
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
              new File({ file: LoggerMain.LOG_FILE }).delete();
              FileHelper.append(LoggerMain.LOG_FILE, 'Rotated log file to ' + zipFile + '\n');
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
  public debug(...args: any): void {
    LoggerMain.log(LogLevel.DEBUG, this.category, ...args);
  }

  /**
   * Logs an info message.
   * @param args - The message arguments.
   */
  public info(...args: any): void {
    LoggerMain.log(LogLevel.INFO, this.category, ...args);
  }

  /**
   * Logs a system message.
   * @param args - The message arguments.
   */
  public system(...args: any): void {
    LoggerMain.log(LogLevel.SYSTEM, this.category, ...args);
  }

  /**
   * Logs a warning message.
   * @param args - The message arguments.
   */
  public warn(...args: any): void {
    LoggerMain.log(LogLevel.WARN, this.category, ...args);
  }

  /**
   * Logs an error message.
   * @param args - The message arguments.
   */
  public error(...args: any): void {
    LoggerMain.log(LogLevel.ERROR, this.category, ...args);
  }
}
