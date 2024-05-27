/* eslint-disable @typescript-eslint/no-explicit-any */
import archiver from 'archiver';
import { app, shell } from 'electron';
import * as fs from 'fs';
import path from 'path';
import { OSHelper } from './OSHelper';

export class FileHelper {
  private constructor() {}

  public static APP_DIR = path.join(OSHelper.getHome(), app.name);

  public static openWithDefaulApp(path: string): void {
    shell.openPath(path);
  }

  public static getResourcesFolder(): string | null {
    let result: string | null = null;

    if (app.isPackaged) {
      result =
        process.resourcesPath +
        path.sep +
        'resources' +
        path.sep +
        'app.asar.unpacked' +
        path.sep +
        'resources';
    } else {
      result = app.getAppPath() + path.sep + 'resources';
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

  public static delete(path: string): void {
    fs.rmSync(path);
  }

  public static read(path: string): string {
    return fs.readFileSync(path).toString();
  }

  public static write(path: string, data: string): void {
    fs.writeFileSync(path, data);
  }

  public static asarPathToAbsolute(filePath: string): string {
    return filePath.replace('.asar' + path.sep, '.asar.unpacked' + path.sep);
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

  public static getLastModified(path: string): number {
    return fs.statSync(path).mtimeMs;
  }

  public static zipFiles(file: string, ...args: Array<string>): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const output = fs.createWriteStream(file);
      const archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
      });

      archive.on('warning', function (err: any) {
        if (err.code != 'ENOENT') {
          reject(err);
          throw err;
        }
      });

      // good practice to catch this error explicitly
      archive.on('error', function (err: any) {
        reject(err);
        throw err;
      });

      archive.pipe(output);
      args.forEach((f) => {
        archive.append(fs.createReadStream(f), {
          name: f.substring(f.lastIndexOf(path.sep) + 1)
        });
      });
      archive.finalize().then(() => {
        resolve();
      });
    });
  }
}
