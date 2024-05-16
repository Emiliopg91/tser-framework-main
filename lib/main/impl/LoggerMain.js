"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerMain = void 0;
var tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/no-explicit-any */
var Logger_1 = require("../../common/Logger");
var Logger_2 = require("../../common/Logger");
var FileHelper_1 = require("./FileHelper");
/**
 * Represents a logging utility for frontend.
 */
var LoggerMain = /** @class */ (function () {
    function LoggerMain() {
    }
    /**
     * Initializes the LoggerMain.
     */
    LoggerMain.initialize = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var level;
            return tslib_1.__generator(this, function (_a) {
                if (!FileHelper_1.FileHelper.exists(LoggerMain.logFolder)) {
                    FileHelper_1.FileHelper.mkdir(LoggerMain.logFolder, true);
                }
                level = process.env.LOG_LEVEL || Logger_2.DefaulLevel;
                LoggerMain.currentLevel = Logger_2.LogLevel[level];
                LoggerMain.error("Prueba excp", new Error("bang"), "asdf");
                return [2 /*return*/];
            });
        });
    };
    /**
     * Logs a message.
     * @param lvl - The log level.
     * @param args - The message arguments.
     */
    LoggerMain.log = function (lvl, category) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var today, dd, mm, yyyy, hh, MM, ss, sss, date, logEntry;
            return tslib_1.__generator(this, function (_a) {
                if (LoggerMain.isLevelEnabled(lvl)) {
                    today = new Date();
                    dd = String(today.getDate()).padStart(2, "0");
                    mm = String(today.getMonth() + 1).padStart(2, "0");
                    yyyy = today.getFullYear();
                    hh = String(today.getHours()).padStart(2, "0");
                    MM = String(today.getMinutes()).padStart(2, "0");
                    ss = String(today.getSeconds()).padStart(2, "0");
                    sss = String(today.getMilliseconds()).padEnd(3, "0");
                    date = "".concat(mm, "/").concat(dd, "/").concat(yyyy, " ").concat(hh, ":").concat(MM, ":").concat(ss, ".").concat(sss);
                    logEntry = "[".concat(date, "][").concat(Logger_2.LogLevel[lvl].padEnd(6, " "), "] (").concat(category.padEnd(8, " "), ") - ").concat(Logger_1.argsToString.apply(void 0, args));
                    FileHelper_1.FileHelper.append(LoggerMain.logFile, logEntry + "\n");
                    console.log(logEntry);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Checks if a log level is enabled.
     * @param lvl - The log level.
     * @returns True if the log level is enabled, otherwise false.
     */
    LoggerMain.isLevelEnabled = function (lvl) {
        return LoggerMain.currentLevel <= lvl;
    };
    /**
     * Logs a debug message.
     * @param args - The message arguments.
     */
    LoggerMain.debug = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        LoggerMain.log.apply(LoggerMain, tslib_1.__spreadArray([Logger_2.LogLevel.DEBUG, "main"], args, false));
    };
    /**
     * Logs an info message.
     * @param args - The message arguments.
     */
    LoggerMain.info = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        LoggerMain.log.apply(LoggerMain, tslib_1.__spreadArray([Logger_2.LogLevel.INFO, "main"], args, false));
    };
    /**
     * Logs a warning message.
     * @param args - The message arguments.
     */
    LoggerMain.warn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        LoggerMain.log.apply(LoggerMain, tslib_1.__spreadArray([Logger_2.LogLevel.WARN, "main"], args, false));
    };
    /**
     * Logs a system message.
     * @param args - The message arguments.
     */
    LoggerMain.system = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        LoggerMain.log.apply(LoggerMain, tslib_1.__spreadArray([Logger_2.LogLevel.SYSTEM, "main"], args, false));
    };
    /**
     * Logs an error message.
     * @param args - The message arguments.
     */
    LoggerMain.error = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        LoggerMain.log.apply(LoggerMain, tslib_1.__spreadArray([Logger_2.LogLevel.ERROR, "main"], args, false));
    };
    LoggerMain.logFile = FileHelper_1.FileHelper.getLogFile();
    LoggerMain.logFolder = FileHelper_1.FileHelper.getLogFolder();
    /**
     * The current log level.
     */
    LoggerMain.currentLevel = Logger_2.LogLevel.INFO;
    return LoggerMain;
}());
exports.LoggerMain = LoggerMain;
