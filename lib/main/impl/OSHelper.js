"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OSHelper = void 0;
var os = require("os");
var OSHelper = /** @class */ (function () {
    function OSHelper() {
    }
    OSHelper.getHome = function () {
        return os.homedir();
    };
    OSHelper.isWindows = function () {
        return process.platform === 'win32';
    };
    OSHelper.isLinux = function () {
        return process.platform === 'linux';
    };
    OSHelper.isMacOS = function () {
        return process.platform === 'darwin';
    };
    return OSHelper;
}());
exports.OSHelper = OSHelper;
