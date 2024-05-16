"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileHelper = void 0;
var electron_1 = require("electron");
var fs = require("fs");
var path_1 = require("path");
var OSHelper_1 = require("./OSHelper");
var FileHelper = /** @class */ (function () {
    function FileHelper() {
    }
    FileHelper.openWithDefaulApp = function (path) {
        electron_1.shell.openPath(path);
    };
    FileHelper.getLogFolder = function () {
        return OSHelper_1.OSHelper.getHome() + path_1.default.sep + electron_1.app.name + path_1.default.sep + "logs";
    };
    FileHelper.getLogFile = function () {
        return FileHelper.getLogFolder() + path_1.default.sep + "application.log";
    };
    FileHelper.getResourcesFolder = function () {
        var result = null;
        if (electron_1.app.isPackaged) {
            result =
                process.resourcesPath +
                    path_1.default.sep +
                    "resources" +
                    path_1.default.sep +
                    "app.asar.unpacked" +
                    path_1.default.sep +
                    "resources";
        }
        else {
            result = electron_1.app.getAppPath() + path_1.default.sep + "resources";
        }
        return result;
    };
    FileHelper.exists = function (path) {
        return fs.existsSync(path);
    };
    FileHelper.mkdir = function (path, recursive) {
        if (recursive === void 0) { recursive = false; }
        fs.mkdirSync(path, { recursive: recursive });
    };
    FileHelper.append = function (path, data) {
        fs.appendFileSync(path, data);
    };
    FileHelper.asarPathToAbsolute = function (filePath) {
        return filePath.replace(".asar" + path_1.default.sep, ".asar.unpacked" + path_1.default.sep);
    };
    return FileHelper;
}());
exports.FileHelper = FileHelper;
