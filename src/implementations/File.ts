import fs from 'fs';
import path from 'path';

export interface FileParameters {
  file: string;
  parentFile?: File;
  parent?: string;
}

export class File {
  private fileName: string;
  private parent: string;
  private absolutePath: string;

  public constructor(params: FileParameters) {
    if (params.parent) {
      params.parentFile = new File({ file: params.parent });
    }

    if (params.parentFile) {
      this.fileName = params.file;
      this.parent = params.parentFile.getAbsolutePath();
      this.absolutePath = this.parent + path.sep + this.fileName;
    } else {
      if (params.file.includes(path.sep)) {
        const lastSlash = params.file.lastIndexOf(path.sep);
        this.fileName = params.file.substring(lastSlash + 1);
        this.parent = params.file.substring(0, lastSlash);
        this.absolutePath = params.file;
      } else {
        this.fileName = params.file;
        this.parent = __dirname;
        this.absolutePath = this.parent + path.sep + this.fileName;
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
    return this.absolutePath;
  }

  public getParent(): string {
    return this.parent;
  }

  public getParentFile(): File {
    return new File({ file: this.parent });
  }

  public isDirectory(): boolean {
    return fs.statSync(this.absolutePath).isDirectory();
  }

  public exists(): boolean {
    return fs.existsSync(this.absolutePath);
  }
}
