import { safeStorage } from "electron";

export class CryptoHelper {
  private constructor() {}

  private static checkCipher() {
    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error("Encryption not available");
    }
  }

  public static encryptSafeStorage(data: string): string {
    CryptoHelper.checkCipher();
    const dataToCipher =
      String(Date.now()).padEnd(40) + Buffer.from(data).toString("base64");
    return safeStorage
      .encryptString(dataToCipher)
      .toString("hex")
      .split("")
      .reverse()
      .join("");
  }

  public static decryptSafeStorage(data: string): string {
    CryptoHelper.checkCipher();
    const b64 = Buffer.from(
      safeStorage
        .decryptString(Buffer.from(data.split("").reverse().join(""), "hex"))
        .substring(40),
      "base64"
    ).toString();
    return b64;
  }
}
