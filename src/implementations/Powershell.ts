import { spawn } from "child_process";
import { LoggerMain } from "./LoggerMain";

interface Entry {
  cmd: string;
  resolve: (data: string) => void;
}

export class Powershell {
  private static PROCESS = spawn("powershell");
  private static READY: boolean = false;
  private static ENTRIES: Array<Entry> = [];
  private static CURRENT: Entry | undefined = undefined;

  public static async initialize(): Promise<void> {
    const promise: Promise<void> = new Promise<void>((resolve) => {
      Powershell.PROCESS.stdout.on("data", function (data: string) {
        const lines = data.toString().split("\n");
        LoggerMain.system("Leidos datos: " + data.toString());
        if (lines[lines.length - 1].trim() == "") {
          lines.pop();
        }
        if (lines[lines.length - 1].startsWith("PS ")) {
          if (Powershell.READY && Powershell.CURRENT) {
            lines.pop();
            const content = lines.join("\n");
            LoggerMain.system("Respuesta al comando " + content);
            Powershell.CURRENT?.resolve(content);
            Powershell.CURRENT = undefined;
          } else {
            if (!Powershell.READY) {
              resolve();
              LoggerMain.system("Powershell ready");
            }
            Powershell.READY = true;
          }
        }
      });
    });

    setInterval(() => {
      if (
        Powershell.READY &&
        !Powershell.CURRENT &&
        Powershell.ENTRIES.length > 0
      ) {
        Powershell.CURRENT = Powershell.ENTRIES.shift();
        LoggerMain.system("Aceptando comando " + Powershell.CURRENT?.cmd);
        Powershell.PROCESS.stdin.write(Powershell.CURRENT?.cmd + "\n");
      }
    }, 100);

    return promise;
  }

  public static async runCommand(cmd: string): Promise<string> {
    const promise = new Promise<string>((resolve) => {
      Powershell.ENTRIES.push({ cmd, resolve });
    });
    return promise;
  }
}
