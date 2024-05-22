import { BrowserWindowConstructorOptions } from "electron";

export interface WindowConfig {
  hideMenu: boolean;
  minimizeToTray: boolean;
  closeToTray: boolean;
  escCloseWindow: boolean;
  zoom: boolean;
  icon: string;
  constructorOptions: BrowserWindowConstructorOptions;
}
