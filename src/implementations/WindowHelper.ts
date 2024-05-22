import {
  BrowserWindow,
  BrowserWindowConstructorOptions,
  shell,
} from "electron";
import { is } from "@electron-toolkit/utils";
import { join } from "path";
import { WindowConfig } from "../types/WindowConfig";
import { LoggerMain } from "./LoggerMain";

export class WindowHelper {
  public static createWindow(
    file: string,
    windowConstructorOption: BrowserWindowConstructorOptions
  ): BrowserWindow {
    const window = new BrowserWindow(windowConstructorOption);

    window.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url);
      return { action: "deny" };
    });

    if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
      window.loadURL(process.env["ELECTRON_RENDERER_URL"] + "/" + file);
    } else {
      window.loadFile(join(__dirname, "../renderer/" + file));
    }

    window.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url);
      return { action: "deny" };
    });

    return window;
  }

  public static createMainWindow(
    windowConfig: WindowConfig
  ): BrowserWindow {
    const mainWindow = this.createWindow("index.html", windowConfig.constructorOptions);

    mainWindow.on("ready-to-show", () => {
      mainWindow?.maximize();
      mainWindow?.show();
      if (is.dev) {
        mainWindow?.webContents.openDevTools();
      }
      LoggerMain.system("---------------- Started renderer ----------------");
    });

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

  public static createSplashScreen(
    windowConstructorOption: BrowserWindowConstructorOptions,
    lifeTime: number,
    forceDev: boolean = false
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      if (!is.dev || forceDev) {
        const splash = this.createWindow(
          "splash.html",
          windowConstructorOption
        );
        splash.show();
        splash.center();

        setTimeout(async () => {
          await this.fadeWindowOut(splash, 0.1, 10);
          splash.close();
          resolve();
        }, lifeTime);
      } else {
        resolve();
      }
    });
  }

  public static fadeWindowOut(
    browserWindowToFadeOut: BrowserWindow,
    step: number,
    ms: number
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
      }, ms);
    });
  }
}
