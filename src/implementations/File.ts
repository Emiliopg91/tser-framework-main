import fs from 'fs';
import path from 'path';

import { Path } from './Path';

export interface FileParameters {
  file: string;
  parentPath?: Path;
  parent?: string;
}

export class File {
  private fileName: string;
  private parent: Path;

  public constructor(params: FileParameters) {
    if (params.parent) {
      params.parentPath = new Path(params.parent);
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
    return JSON.stringify(this);
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
}
