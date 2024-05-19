import { spawn } from "child_process";

export class Powershell {
  private static PROCESS = spawn("powershell");
  private static COMMANDS: Array<string> = [];
  private static RESOLVERS: Array<(data: string) => void> = [];
  private static IS_RUNNING: boolean = false;
  private static ACTUAL_OUTPUT: boolean = false;

  public static initialize() {
    Powershell.PROCESS.stdout.on("data", function (data: string) {
      const lines = data.toString().split("\n");
      if (lines[lines.length - 1].trim() == "") {
        lines.pop();
      }
      if (lines[lines.length - 1].startsWith("PS ")) {
        if (Powershell.ACTUAL_OUTPUT && Powershell.RESOLVERS.length > 0) {
          Powershell.RESOLVERS[0](data);
          Powershell.RESOLVERS.shift();
          Powershell.IS_RUNNING = false;
        } else {
          Powershell.ACTUAL_OUTPUT = true;
        }
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
