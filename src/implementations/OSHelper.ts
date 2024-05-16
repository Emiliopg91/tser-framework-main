import * as os from 'os';

export class OSHelper {
  private constructor() {}

  public static getHome(): string {
    return os.homedir();
  }

  public static isWindows(): boolean {
    return process.platform === 'win32';
  }

  public static isLinux(): boolean {
    return process.platform === 'linux';
  }

  public static isMacOS(): boolean {
    return process.platform === 'darwin';
  }
}
