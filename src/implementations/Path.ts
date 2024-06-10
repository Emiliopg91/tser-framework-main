import path from 'path';

import { File } from './File';

export class Path {
  private node: string;

  constructor(node: string) {
    this.node = node.split('/').join(path.sep);
    if (!path.isAbsolute(this.node)) {
      this.node = path.resolve(__dirname, this.node);
    }
  }

  public resolve(relative: string): Path {
    return new Path(path.resolve(this.node, relative));
  }

  public relative(to: string): Path {
    return new Path(path.relative(this.node, to));
  }

  public toFile(): File {
    return new File({ file: this.node });
  }

  public getPath(): string {
    return this.node;
  }

  public toString(): string {
    return this.node;
  }
}
