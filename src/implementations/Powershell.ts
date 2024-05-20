import { spawn } from "child_process";
import { LoggerMain } from "./LoggerMain";

interface Entry {
  cmd: string;
  resolve: (data: string) => void;
}

export class Powershell {
  private static PROCESS: any | undefined = null;
  private static READY: boolean = false;
  private static ENTRIES: Array<Entry> = [];
  private static CURRENT: Entry | undefined = undefined;
  private static OUTPUT: string = "";

  public static async initialize(): Promise<void> {
    const promise: Promise<void> = new Promise<void>((resolve) => {
      Powershell.PROCESS = spawn("powershell");
      Powershell.PROCESS.stdout.on("data", function (data: string) {
        const lines = data.toString().split("\n");

        if (!Powershell.READY) {
          if (lines[lines.length - 1].startsWith("PS ")) {
            LoggerMain.system("Powershell ready");
            Powershell.READY = true;
            resolve();
          }
        } else {
          if (lines[lines.length - 1].trim() == "") {
            lines.pop();
          }
          if (Powershell.CURRENT) {
            if (lines.length > 0) {
              if (
                Powershell.OUTPUT == "" &&
                lines[0].trim() == Powershell.CURRENT.cmd
              ) {
                lines.shift();
              }
              if (lines.length > 0) {
                if (lines[lines.length - 1].startsWith("PS ")) {
                  lines.pop();
                  Powershell.OUTPUT += lines.join("\n");
                  const outLines = Powershell.OUTPUT.split("\n");
                  while (outLines.length > 0 && outLines[0].trim() == "") {
                    outLines.shift();
                  }
                  while (
                    outLines.length > 0 &&
                    outLines[outLines.length - 1].trim() == ""
                  ) {
                    outLines.pop();
                  }

                  Powershell.CURRENT?.resolve(outLines.join("\n"));
                  Powershell.OUTPUT = "";
                  Powershell.CURRENT = undefined;
                } else {
                  Powershell.OUTPUT += lines.join("\n");
                }
              }
            }
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
        Powershell.PROCESS.stdin.write(Powershell.CURRENT?.cmd + "\n");
      }
    }, 100);

    return promise;
  }

  public static async runCommand(cmd: string, ...args: any): Promise<string> {
    const promise = new Promise<string>((resolve) => {
      let command = cmd;
      if (args) {
        command = command + " " + args.join(" ");
      }
      Powershell.ENTRIES.push({ cmd: command.trim(), resolve });
    });
    return promise;
  }
}
