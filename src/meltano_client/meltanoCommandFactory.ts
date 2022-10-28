import { Uri, workspace } from "vscode";
import { PluginType } from "../domain";
import { provideSingleton } from "../utils";

export interface CommandProcessExecutionParams {
  cwd?: string;
  args: string[];
}

export interface MeltanoCommand {
  commandAsString?: string;
  statusMessage: string;
  processExecutionParams: CommandProcessExecutionParams;
  focus?: boolean;
}

@provideSingleton(MeltanoCommandFactory)
export class MeltanoCommandFactory {
  private getFirstWorkspacePath(): string {
    // Meltano must be executed in a project directory
    const folders = workspace.workspaceFolders;
    if (folders) {
      return folders[0].uri.fsPath;
    } else {
      // TODO: this shouldn't happen but we should make sure this is valid fallback
      return Uri.file("./").fsPath;
    }
  }

  createVerifyMeltanoInstalledCommand(): MeltanoCommand {
    return {
      statusMessage: "Detecting Meltano installation...",
      processExecutionParams: {
        cwd: this.getFirstWorkspacePath(),
        args: ["--version"],
      },
    };
  }

  createMeltanoAddCommand(pluginType: PluginType, pluginName: string, pluginVariant: string): MeltanoCommand {
    return {
      statusMessage: "Adding plugin to Meltano...",
      commandAsString: `meltano add ${pluginType} ${pluginName} --variant ${pluginVariant}`,
      processExecutionParams: {
        cwd: this.getFirstWorkspacePath(),
        args: ["add", pluginType, pluginName, "--variant", pluginVariant],
      },
      focus: true
    };
  }

}
