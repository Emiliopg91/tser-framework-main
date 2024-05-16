"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaulLevel = exports.argsToString = exports.LogLevel = void 0;
/**
 * Represents log levels.
 */
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["SYSTEM"] = 3] = "SYSTEM";
    LogLevel[LogLevel["ERROR"] = 4] = "ERROR";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
function argsToString() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var strArgs = [];
    args.forEach(function (arg) {
        if (!(arg instanceof Error)) {
            strArgs.push(typeof arg === "object" ? JSON.stringify(arg) : arg);
        }
    });
    args.forEach(function (arg) {
        if (arg instanceof Error) {
            if (arg.stack) {
                strArgs.push(arg.stack);
            }
            else {
                strArgs.push("\n" + arg.name + ": " + arg.message);
            }
        }
    });
    return strArgs.join(" ");
}
exports.argsToString = argsToString;
exports.DefaulLevel = LogLevel[LogLevel.INFO];
