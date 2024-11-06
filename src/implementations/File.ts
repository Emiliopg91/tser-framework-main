import fs from 'fs';
import path from 'path';

import { Path } from './Path';

export interface FileParameters {
  file: string;
  parentPath?: Path;
  parentFile?: File;
  parent?: string;
}

export class File {
  private fileName: string;
  private parent: Path;

  public constructor(params: FileParameters) {
    params.file = params.file.split('/').join(path.sep);
    if (params.parent) {
      params.parentPath = new Path(params.parent);
    } else {
      if (params.parentFile) {
        params.parentPath = params.parentFile.toPath();
      }
    }

    if (params.parentPath) {
      this.fileName = params.file;
      this.parent = params.parentPath;
    } else {
      const lastSlash = params.file.lastIndexOf(path.sep);
      if (path.isAbsolute(params.file)) {
        this.fileName = params.file.substring(lastSlash + 1);
        this.parent = new Path(params.file.substring(0, lastSlash));
      } else {
        if (lastSlash > -1) {
          this.fileName = params.file.substring(lastSlash + 1);
          this.parent = new Path(path.join(__dirname, params.file.substring(0, lastSlash)));
        } else {
          this.fileName = params.file;
          this.parent = new Path(__dirname);
        }
      }
    }
  }

  public toString(): string {
    return this.getAbsolutePath();
  }

  public toPath(): Path {
    return new Path(this.getAbsolutePath());
  }

  public getName(): string {
    return this.fileName;
  }

  public getAbsolutePath(): string {
    return path.join(this.parent.getPath(), this.fileName);
  }

  public getParent(): string {
    return this.parent.getPath();
  }

  public getParentFile(): File {
    return this.parent.toFile();
  }

  public isDirectory(): boolean {
    return fs.statSync(this.getAbsolutePath()).isDirectory();
  }

  public exists(): boolean {
    return fs.existsSync(this.getAbsolutePath());
  }

  public mkdir(recursive: boolean = true): void {
    fs.mkdirSync(this.getAbsolutePath(), { recursive: recursive });
  }

  public createFile(): void {
    fs.closeSync(fs.openSync(this.getAbsolutePath(), 'w'));
  }

  public list(): Array<File> {
    const res: Array<File> = [];
    fs.readdirSync(this.getAbsolutePath()).forEach((f) => {
      res.push(new File({ file: f, parentFile: this }));
    });
    return res;
  }

  public delete(): void {
    if (this.isDirectory()) {
      this.list().forEach((f) => f.delete());
      fs.rmdirSync(this.getAbsolutePath());
    } else {
      fs.rmSync(this.getAbsolutePath());
    }
  }

  public copy(dst: File): void {
    fs.copyFileSync(this.getAbsolutePath(), dst.getAbsolutePath());
  }

  public move(dst: File): void {
    fs.renameSync(this.getAbsolutePath(), dst.getAbsolutePath());
  }

  public getLastModified(): number {
    return Math.trunc(fs.statSync(this.getAbsolutePath()).mtimeMs);
  }

  public setLastModified(date: number): void {
    fs.utimesSync(this.getAbsolutePath(), new Date(date), new Date(date));
  }

  public getSize(): number {
    return fs.statSync(this.getAbsolutePath()).size;
  }

  public static walkFileTree(
    pathF: Path,
    preVisitDir?: (path: Path) => FileTreeAction,
    postVisitDir?: (path: Path) => void,
    visitFile?: (path: Path) => void
  ): void {
    let action = FileTreeAction.CONTINUE;

    const files = pathF.toFile().list();
    for (const file of files) {
      if (file.isDirectory()) {
        if (preVisitDir) {
          action = preVisitDir(file.toPath());
        }
        if (action == FileTreeAction.CONTINUE) {
          File.walkFileTree(file.toPath(), preVisitDir, postVisitDir, visitFile);
          if (postVisitDir) {
            postVisitDir(file.toPath());
          }
        }
      } else {
        if (visitFile) {
          visitFile(file.toPath());
        }
      }
    }
  }
}

export enum FileTreeAction {
  CONTINUE,
  SKIP_SUBTREE
}
