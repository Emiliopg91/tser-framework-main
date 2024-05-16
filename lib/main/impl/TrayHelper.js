"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrayMenuBuilder = exports.TrayBuilder = void 0;
var electron_1 = require("electron");
var LoggerMain_1 = require("./LoggerMain");
var TrayBuilder = /** @class */ (function () {
    function TrayBuilder(iconPath) {
        this.toolTip = null;
        this.contextMenu = null;
        this.iconPath = iconPath;
    }
    TrayBuilder.builder = function (iconPath) {
        return new TrayBuilder(iconPath);
    };
    TrayBuilder.prototype.withToolTip = function (text) {
        this.toolTip = text;
        return this;
    };
    TrayBuilder.prototype.withContextMenu = function (menu) {
        this.contextMenu = menu;
        return this;
    };
    TrayBuilder.prototype.build = function () {
        try {
            var tray = new electron_1.Tray(electron_1.nativeImage.createFromPath(this.iconPath));
            if (this.toolTip)
                tray.setToolTip(this.toolTip);
            if (this.contextMenu)
                tray.setContextMenu(this.contextMenu);
            return tray;
        }
        catch (error) {
            LoggerMain_1.LoggerMain.error('Error creating tray icon', error);
            throw error;
        }
    };
    return TrayBuilder;
}());
exports.TrayBuilder = TrayBuilder;
var TrayMenuBuilder = /** @class */ (function () {
    function TrayMenuBuilder() {
        this.entries = [];
    }
    TrayMenuBuilder.builder = function () {
        return new TrayMenuBuilder();
    };
    TrayMenuBuilder.prototype.addLabel = function (label, click) {
        if (click === void 0) { click = undefined; }
        this.entries.push({ label: label, type: 'normal', click: click });
        return this;
    };
    TrayMenuBuilder.prototype.addSeparator = function () {
        this.entries.push({ type: 'separator' });
        return this;
    };
    TrayMenuBuilder.prototype.build = function () {
        return electron_1.Menu.buildFromTemplate(this.entries);
    };
    return TrayMenuBuilder;
}());
exports.TrayMenuBuilder = TrayMenuBuilder;
