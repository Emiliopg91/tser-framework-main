import { spawn } from "child_process";
import { Mutex } from "async-mutex";

export class Powershell {
  private static PROCESS = spawn("powershell");
  private static OUTPUT = "";
  private static COMMANDS: Array<string> = [];
  private static RESOLVERS: Array<(data: string) => void> = [];
  private static IS_RUNNING: boolean = false;

  public static initialize() {
    Powershell.PROCESS.stderr.on("data", function (data: string) {
      Powershell.OUTPUT += data;
    });
    Powershell.PROCESS.stdout.on("data", function (data: string) {
      if (data.toString().startsWith("PS ")) {
        if (Powershell.RESOLVERS.length > 0) {
          Powershell.RESOLVERS[0](Powershell.OUTPUT);
          Powershell.RESOLVERS.shift();
          Powershell.IS_RUNNING = false;
          Powershell.OUTPUT = "";
        }
      } else {
        Powershell.OUTPUT += data;
      }
    });

    setInterval(() => {
      if (!Powershell.IS_RUNNING && Powershell.COMMANDS.length > 0) {
        Powershell.IS_RUNNING = true;
        Powershell.PROCESS.stdin.write(Powershell.COMMANDS[0] + "\n");
        Powershell.COMMANDS.shift();
      }
    }, 100);
  }

  public static async runCommand(cmd: string): Promise<string> {
    const promise = new Promise<string>((resolve) => {
      Powershell.RESOLVERS.push(resolve);
      Powershell.COMMANDS.push(cmd);
    });
    return promise;
  }
}
