import { CancellationToken, Disposable, workspace } from "vscode";
import { provideSingleton } from "../utils";

import { CommandProcessExecution, CommandProcessExecutionFactory } from "../commandProcessExecution";
import { MeltanoTerminal } from "./meltanoTerminal";
import { MeltanoCommand, MeltanoCommandFactory } from "./meltanoCommandFactory";
import { PluginType } from "../domain";
import { MeltanoCommandQueue } from "./meltanoCommandQueue";

@provideSingleton(MeltanoClient)
export class MeltanoClient implements Disposable {
    private disposables: Disposable[] = [];

    constructor(
        private meltanoCommandFactory: MeltanoCommandFactory,
        private commandProcessExecutionFactory: CommandProcessExecutionFactory,
        private queue: MeltanoCommandQueue,
        private terminal: MeltanoTerminal
    ) {}

    dispose() {
        while (this.disposables.length) {
            const x = this.disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    async addPlugin(pluginType: PluginType, pluginName: string, pluginVariant: string) {
        this.addCommandToQueue(
            this.meltanoCommandFactory.createMeltanoAddCommand(pluginType, pluginName, pluginVariant)
        );
    }

    addCommandToQueue(command: MeltanoCommand) {
        this.queue.addToQueue({
            command: (token) => this.executeCommandImmediately(command, token),
            statusMessage: command.statusMessage,
            focus: command.focus,
        });
    }

    async executeCommandImmediately(
        command: MeltanoCommand,
        token?: CancellationToken
    ) {
        const completedProcess = await this.executeCommand(command, token);
        completedProcess.completeWithTerminalOutput(this.terminal);
        completedProcess.dispose();
    }

    public async executeCommand(
        command: MeltanoCommand,
        token?: CancellationToken
    ): Promise<CommandProcessExecution> {
        const { args, cwd } = command.processExecutionParams;
        const configText = workspace.getConfiguration();
        const config = JSON.parse(JSON.stringify(configText));
        let envVars = {};
        if (config.terminal !== undefined && config.terminal.integrated !== undefined && config.terminal.integrated.env !== undefined) {
            const env = config.terminal.integrated.env;
            const regexVsCodeEnv = /\$\{env\:(.*?)\}/gm;
            for (let prop in env) {
                const vsCodeEnv = env[prop];
                envVars = {
                    ...process.env,
                    ...envVars,
                    ...this.parseEnvVarsFromUserSettings(vsCodeEnv, regexVsCodeEnv)
                };
            }
        }
        if (command.commandAsString !== undefined) {
            this.terminal.log(`> Executing task: ${command.commandAsString}\n\r`);
            if (command.focus) {
                this.terminal.show(true);
            }
        }

        return this.commandProcessExecutionFactory.createCommandProcessExecution(
            "meltano",
            args,
            cwd,
            token,
            envVars
        );
    }

    private parseEnvVarsFromUserSettings(vsCodeEnv: { [k: string]: string }, regexVsCodeEnv: RegExp) {
        return Object.keys(vsCodeEnv).reduce((prev: { [k: string]: string }, key: string) => {
            const value = vsCodeEnv[key];
            let matchResult;
            while ((matchResult = regexVsCodeEnv.exec(value)) !== null) {
                if (matchResult.index === regexVsCodeEnv.lastIndex) {
                    regexVsCodeEnv.lastIndex++;
                }
                if (process.env[matchResult[1]] !== undefined) {
                    prev[key] = prev[key].replace(new RegExp(`\\\$\\\{env\\\:${matchResult[1]}\\\}`, "gm"), process.env[matchResult[1]]!);
                }
            }
            return prev;
        }, vsCodeEnv);
    }

}
