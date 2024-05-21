/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DefaulLevel,
  LogLevel,
  loggerArgsToString,
} from "@tser-framework/commons";
import { FileHelper } from "./FileHelper";
import path from "path";
import { Mutex } from "async-mutex";

/**
 * Represents a logging utility for frontend.
 */
export class LoggerMain {
  private constructor() {}

  private static mutex: Mutex = new Mutex();

  private static LOG_FOLDER = path.join(FileHelper.APP_DIR, "logs");
  private static OLD_FOLDER = path.join(LoggerMain.LOG_FOLDER, "old");
  public static LOG_FILE = path.join(LoggerMain.LOG_FOLDER, "application.log");

  /**
   * The current log level.
   */
  private static currentLevel = LogLevel.INFO;

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

    console.log("Logger writing to file " + LoggerMain.LOG_FILE);

    const level: string = process.env.LOG_LEVEL || DefaulLevel;
    LoggerMain.currentLevel = LogLevel[level as keyof typeof LogLevel];
  }

  /**
   * Logs a message.
   * @param lvl - The log level.
   * @param args - The message arguments.
   */
  public static log(lvl: LogLevel, category: string, ...args: any): void {
    LoggerMain.mutex.acquire().then((release) => {
      LoggerMain.archiveLogFile().then(() => {
        if (LoggerMain.isLevelEnabled(lvl)) {
          const today = new Date();
          const dd = String(today.getDate()).padStart(2, "0");
          const mm = String(today.getMonth() + 1).padStart(2, "0");
          const yyyy = today.getFullYear();
          const hh = String(today.getHours()).padStart(2, "0");
          const MM = String(today.getMinutes()).padStart(2, "0");
          const ss = String(today.getSeconds()).padStart(2, "0");
          const sss = String(today.getMilliseconds()).padEnd(3, "0");
          const date = `${mm}/${dd}/${yyyy} ${hh}:${MM}:${ss}.${sss}`;

          const logEntry = `[${date}][${LogLevel[lvl].padEnd(
            6,
            " "
          )}] (${category.padEnd(8, " ")}) - ${loggerArgsToString(...args)}`;
          FileHelper.append(LoggerMain.LOG_FILE, logEntry + "\n");
          console.log(logEntry);
        }
        release();
      });
    });
  }

  private static archiveLogFile(): Promise<void> {
    return new Promise<void>((resolve) => {
      const fileDate = new Date(
        FileHelper.getLastModified(LoggerMain.LOG_FILE)
      );
      let now = new Date();

      if (fileDate.getDate() != now.getDate()) {
        const zipFile = path.join(
          LoggerMain.OLD_FOLDER,
          "application-" +
            fileDate.getFullYear() +
            "-" +
            String(fileDate.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(fileDate.getDate()).padStart(2, "0") +
            ".zip"
        );
        FileHelper.zipFiles(zipFile, LoggerMain.LOG_FILE)
          .then(() => {
            FileHelper.delete(LoggerMain.LOG_FILE);
            FileHelper.append(
              LoggerMain.LOG_FILE,
              "Rotated log file to " + zipFile + "\n"
            );
            console.log("Rotated log file to " + zipFile + "\n");
            resolve();
          })
          .catch(() => {
            resolve();
          });
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
    return LoggerMain.currentLevel <= lvl;
  }

  /**
   * Logs a debug message.
   * @param args - The message arguments.
   */
  public static debug(...args: any): void {
    LoggerMain.log(LogLevel.DEBUG, "main", ...args);
  }

  /**
   * Logs an info message.
   * @param args - The message arguments.
   */
  public static info(...args: any): void {
    LoggerMain.log(LogLevel.INFO, "main", ...args);
  }

  /**
   * Logs a warning message.
   * @param args - The message arguments.
   */
  public static warn(...args: any): void {
    LoggerMain.log(LogLevel.WARN, "main", ...args);
  }

  /**
   * Logs a system message.
   * @param args - The message arguments.
   */
  public static system(...args: any): void {
    LoggerMain.log(LogLevel.SYSTEM, "main", ...args);
  }

  /**
   * Logs an error message.
   * @param args - The message arguments.
   */
  public static error(...args: any): void {
    LoggerMain.log(LogLevel.ERROR, "main", ...args);
  }
}
