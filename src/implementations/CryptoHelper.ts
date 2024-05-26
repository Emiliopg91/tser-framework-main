import { safeStorage } from 'electron';

export class CryptoHelper {
  private constructor() {}

  private static checkCipher(): void {
    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error('Encryption not available');
    }
  }

  public static decrypt(data: string): string {
    if (data.startsWith('{enc}')) {
      if (data.startsWith('{enc}{sse}')) {
        return CryptoHelper.decryptSafeStorage(data);
      } else {
        throw new Error('Unrecognized ' + data.substring(5, 10) + ' encription');
      }
    } else {
      throw new Error('Data not encrypted');
    }
  }

  public static encryptSafeStorage(data: string): string {
    CryptoHelper.checkCipher();
    const dataToCipher = String(Date.now()).padEnd(20) + Buffer.from(data).toString('base64');
    return (
      '{enc}{sse}' +
      safeStorage.encryptString(dataToCipher).toString('hex').split('').reverse().join('')
    );
  }

  public static decryptSafeStorage(data: string): string {
    CryptoHelper.checkCipher();
    if (data.startsWith('{enc}{sse}')) {
      const b64 = Buffer.from(
        safeStorage
          .decryptString(Buffer.from(data.substring(10).split('').reverse().join(''), 'hex'))
          .substring(20),
        'base64'
      ).toString();
      return b64;
    } else {
      throw new Error('Unrecognized ' + data.substring(5, 10) + ' encription');
    }
  }
}
