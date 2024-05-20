import { app, shell } from "electron";
import * as fs from "fs";
import path from "path";

export class FileHelper {
  private constructor() {}

  public static openWithDefaulApp(path: string): void {
    shell.openPath(path);
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

  public static findFile(fileName: string, dir: string): Array<string> {
    const result: Array<string> = [];
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const fileStat = fs.statSync(filePath);
      if (fileStat.isDirectory()) {
        FileHelper.findFile(fileName, filePath).forEach((f) => {
          result.push(f);
        });
      } else if (file.endsWith(fileName)) {
        result.push(file);
      }
    }
    return result;
  }
}
