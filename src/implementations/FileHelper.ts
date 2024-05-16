import { app, shell } from "electron";
import * as fs from "fs";
import path from "path";
import { OSHelper } from "./OSHelper";

export class FileHelper {
  private constructor() {}

  public static openWithDefaulApp(path: string): void {
    shell.openPath(path);
  }

  public static getLogFolder(): string {
    return OSHelper.getHome() + path.sep + app.name + path.sep + "logs";
  }

  public static getLogFile(): string {
    return FileHelper.getLogFolder() + path.sep + "application.log";
  }

  public static getResourcesFolder(): string | null {
    let result: string | null = null;

    if (app.isPackaged) {
      result =
        process.resourcesPath +
        path.sep +
        "resources" +
        path.sep +
        "app.asar.unpacked" +
        path.sep +
        "resources";
    } else {
      result = app.getAppPath() + path.sep + "resources";
    }

    return result;
  }

  public static exists(path: string): boolean {
    return fs.existsSync(path);
  }

  public static mkdir(path: string, recursive: boolean = false): void {
    fs.mkdirSync(path, { recursive: recursive });
  }

  public static append(path: string, data: string): void {
    fs.appendFileSync(path, data);
  }

  public static asarPathToAbsolute(filePath: string): string {
    return filePath.replace(".asar" + path.sep, ".asar.unpacked" + path.sep);
  }
}
