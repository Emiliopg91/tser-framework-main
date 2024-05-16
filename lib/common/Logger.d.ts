/**
 * Represents log levels.
 */
export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    SYSTEM = 3,
    ERROR = 4
}
export interface LoggerEventData {
    level: string;
    msg: string;
}
export declare function argsToString(...args: any): string;
export declare const DefaulLevel: string;
