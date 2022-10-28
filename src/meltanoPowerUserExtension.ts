import { Disposable, ExtensionContext, window, commands } from "vscode";
import { TreeviewProviders } from "./treeview_provider";
import { WebviewViewProviders } from "./webviewview_provider";
import { VSCodeCommands } from "./commands";
import { MeltanoClient } from "./meltano_client";
import { provideSingleton } from "./utils";

@provideSingleton(MeltanoPowerUserExtension)
export class MeltanoPowerUserExtension implements Disposable {
    static meltanoMode = { language: "yaml", scheme: "file" };
    private disposables: Disposable[] = [];

    constructor(
        private treeviewProviders: TreeviewProviders,
        private webviewviewProviders: WebviewViewProviders,
        private meltanoClient: MeltanoClient,
        private commands: VSCodeCommands
    ) {
        this.disposables.push(
            this.treeviewProviders,
            this.webviewviewProviders,
            this.meltanoClient,
            this.commands,
        );
    }

    dispose() {
        this.disposables.forEach(disposable => disposable.dispose());
    }

    async activate(context: ExtensionContext): Promise<void> {
        commands.executeCommand('setContext', 'meltanoPowerUser.treeViews', [
            'extractor_treeview',
            'loader_treeview',
            'utility_treeview',
            'orchestrator_treeview',
            'transformer_treeview',
            'file_treeview',
        ]);
    }
}
