import { BrowserWindow, app, shell } from "electron";
import { is } from "@electron-toolkit/utils";
import { join } from "path";
import { WindowConfig } from "../types/WindowConfig";
import { LoggerMain } from "./LoggerMain";

export class WindowHelper {
  public static createWindow(
    title: string,
    preload: string,
    icon: string,
    minimizeToTray: boolean = false,
    hideMenu: boolean = false
  ): BrowserWindow {
    const window = new BrowserWindow({
      width: 900,
      height: 670,
      show: false,
      title: title,
      autoHideMenuBar: hideMenu,
      ...(process.platform === "linux" ? { icon } : {}),
      webPreferences: {
        preload: join(__dirname, preload),
        sandbox: false,
      },
    });

    window.on("ready-to-show", () => {
      window?.show();
      window?.maximize();
      if (is.dev) {
        window?.webContents.openDevTools();
      }
      LoggerMain.system("---------------- Started renderer ----------------");
    });

    window.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url);
      return { action: "deny" };
    });

    if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
      window.loadURL(process.env["ELECTRON_RENDERER_URL"]);
    } else {
      window.loadFile(join(__dirname, "../renderer/index.html"));
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.on("minimize", function (event: any) {
      if (minimizeToTray) {
        event.preventDefault();
        window?.hide();
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.on("closed", () => {
      LoggerMain.system("---------------- Stopped renderer ----------------");
    });

    return window;
  }

  public static createMainWindow(windowConfig: WindowConfig): BrowserWindow {
    // Create the browser window.
    const mainWindow = this.createWindow(
      app.getName(),
      join(__dirname, "../preload/index.js"),
      windowConfig.icon,
      windowConfig.minimizeToTray,
      windowConfig.hideMenu
    );

    mainWindow.on("ready-to-show", () => {
      mainWindow?.show();
      mainWindow?.maximize();
      if (is.dev) {
        mainWindow?.webContents.openDevTools();
      }
      LoggerMain.system("---------------- Started renderer ----------------");
    });

    mainWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url);
      return { action: "deny" };
    });

    if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
      mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
    } else {
      mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mainWindow.on("minimize", function (event: any) {
      if (windowConfig.minimizeToTray) {
        event.preventDefault();
        mainWindow?.hide();
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mainWindow.on("closed", () => {
      LoggerMain.system("---------------- Stopped renderer ----------------");
    });

    return mainWindow;
  }

  public static createSplashWindow(lifeTime: number): Promise<void> {
    return new Promise<void>((resolve) => {
      const splash = new BrowserWindow({
        width: 500,
        height: 300,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
      });
      if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
        splash.loadURL(process.env["ELECTRON_RENDERER_URL"] + "/splash.html");
      } else {
        splash.loadFile(join(__dirname, "../renderer/splash.html"));
      }
      splash.show();
      splash.center();

      setTimeout(async () => {
        await this.fadeWindowOut(splash);
        splash.close();
        resolve();
      }, lifeTime);
    });
  }

  public static fadeWindowOut(
    browserWindowToFadeOut: BrowserWindow,
    step = 0.1,
    fadeEveryXSeconds = 10
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      let opacity = browserWindowToFadeOut.getOpacity();
      const interval = setInterval(() => {
        if (opacity <= 0) {
          resolve();
          clearInterval(interval);
        }

        browserWindowToFadeOut.setOpacity(opacity);
        opacity -= step;
      }, fadeEveryXSeconds);
    });
  }
}
