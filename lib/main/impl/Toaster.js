"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Toaster = void 0;
var electron_1 = require("electron");
var OSHelper_1 = require("./OSHelper");
var Toaster = /** @class */ (function () {
    function Toaster() {
    }
    Toaster.toast = function (body, icon, onClick) {
        if (icon === void 0) { icon = undefined; }
        if (onClick === void 0) { onClick = undefined; }
        var toastXml = undefined;
        if (OSHelper_1.OSHelper.isWindows()) {
            if (icon) {
                toastXml =
                    "<toast><visual><binding template='ToastImageAndText02'><image id='1' src='" +
                        icon +
                        "'/><text id='1'>" +
                        electron_1.app.name +
                        "</text><text id='2'>" +
                        body +
                        '</text></binding></visual></toast>';
            }
            else {
                toastXml =
                    "<toast><visual><binding template='ToastText02'><text id='1'>" +
                        electron_1.app.name +
                        "</text><text id='2'>" +
                        body +
                        '</text></binding></visual></toast>';
            }
        }
        var notif = new electron_1.Notification({ title: electron_1.app.name, body: body, icon: icon, toastXml: toastXml });
        if (onClick) {
            notif.on('click', onClick);
        }
        notif.show();
    };
    return Toaster;
}());
exports.Toaster = Toaster;
