import { safeStorage } from 'electron';

import { OSHelper } from './OSHelper';

export class CryptoHelper {
  private static PREFIX_ENC = '{enc}';
  private static PREFIX_SSE = '{sse}';
  private static PREFIX_C4U = '{c4u}';

  private constructor() {}

  private static checkCipher(): void {
    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error('Encryption not available');
    }
  }

  public static decrypt(data: string): string {
    if (data.startsWith(CryptoHelper.PREFIX_ENC)) {
      if (data.startsWith(CryptoHelper.PREFIX_ENC + CryptoHelper.PREFIX_SSE)) {
        return CryptoHelper.decryptSafeStorage(data);
      } else if (data.startsWith(CryptoHelper.PREFIX_ENC + CryptoHelper.PREFIX_C4U)) {
        return CryptoHelper.decryptForUser(data);
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
      CryptoHelper.PREFIX_ENC +
      CryptoHelper.PREFIX_SSE +
      safeStorage.encryptString(dataToCipher).toString('hex').split('').reverse().join('')
    );
  }

  public static encryptForUser(data: string): string {
    CryptoHelper.checkCipher();
    const dataToCipher =
      String(Date.now()).padEnd(20) +
      OSHelper.getUsername().padEnd(20) +
      Buffer.from(data).toString('base64');
    return (
      CryptoHelper.PREFIX_ENC +
      CryptoHelper.PREFIX_SSE +
      safeStorage.encryptString(dataToCipher).toString('hex').split('').reverse().join('')
    );
  }

  public static decryptForUser(data: string): string {
    CryptoHelper.checkCipher();
    if (data.startsWith(CryptoHelper.PREFIX_ENC + CryptoHelper.PREFIX_SSE)) {
      const dec = safeStorage.decryptString(
        Buffer.from(data.substring(10).split('').reverse().join(''), 'hex')
      );
      const user = dec.substring(20, 40);
      if (user.trim() != OSHelper.getUsername()) {
        throw new Error('Invalid data for current user');
      }
      const b64 = Buffer.from(dec.substring(40), 'base64').toString();
      return b64;
    } else {
      throw new Error('Unrecognized ' + data.substring(5, 10) + ' encription');
    }
  }

  public static decryptSafeStorage(data: string): string {
    CryptoHelper.checkCipher();
    if (data.startsWith(CryptoHelper.PREFIX_ENC + CryptoHelper.PREFIX_SSE)) {
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
