import { LogLevel } from "../../common/Logger";
/**
 * Represents a logging utility for frontend.
 */
export declare class LoggerMain {
    private constructor();
    private static logFile;
    private static logFolder;
    /**
     * The current log level.
     */
    private static currentLevel;
    /**
     * Initializes the LoggerMain.
     */
    static initialize(): Promise<void>;
    /**
     * Logs a message.
     * @param lvl - The log level.
     * @param args - The message arguments.
     */
    static log(lvl: LogLevel, category: string, ...args: any): Promise<void>;
    /**
     * Checks if a log level is enabled.
     * @param lvl - The log level.
     * @returns True if the log level is enabled, otherwise false.
     */
    private static isLevelEnabled;
    /**
     * Logs a debug message.
     * @param args - The message arguments.
     */
    static debug(...args: any): void;
    /**
     * Logs an info message.
     * @param args - The message arguments.
     */
    static info(...args: any): void;
    /**
     * Logs a warning message.
     * @param args - The message arguments.
     */
    static warn(...args: any): void;
    /**
     * Logs a system message.
     * @param args - The message arguments.
     */
    static system(...args: any): void;
    /**
     * Logs an error message.
     * @param args - The message arguments.
     */
    static error(...args: any): void;
}
