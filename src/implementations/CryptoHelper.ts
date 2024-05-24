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
      String(Date.now()).padEnd(20) + Buffer.from(data).toString("base64");
    return (
      "{sse}" +
      safeStorage
        .encryptString(dataToCipher)
        .toString("hex")
        .split("")
        .reverse()
        .join("")
    );
  }

  public static decryptSafeStorage(data: string): string {
    CryptoHelper.checkCipher();
    if (data.startsWith("{sse}")) {
      const b64 = Buffer.from(
        safeStorage
          .decryptString(
            Buffer.from(data.substring(5).split("").reverse().join(""), "hex")
          )
          .substring(20),
        "base64"
      ).toString();
      return b64;
    } else {
      throw new Error("Unrecognized " + data.substring(0, 5) + " encription");
    }
  }
}