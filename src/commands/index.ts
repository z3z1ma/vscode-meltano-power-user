import { commands, Disposable, Uri } from "vscode";
import { MeltanoTreeItem } from "../treeview_provider/meltanoTreeviewProvider";
import { provideSingleton } from "../utils";

import { MeltanoHubPanel } from "../webviewview_provider/meltanoHub";
import { MeltanoClient } from "../meltano_client";
import { PluginType } from "../domain";

@provideSingleton(VSCodeCommands)
export class VSCodeCommands implements Disposable {
    private disposables: Disposable[] = [];

    constructor(
        private meltanoClient: MeltanoClient,
        private meltanoHubPanel: MeltanoHubPanel
    ) {
        this.disposables.push(
            commands.registerCommand("meltanoPowerUser.openPluginInWebview", async (url: Uri) => {
                await commands.executeCommand("workbench.view.extension.meltanoHub");
                await this.meltanoHubPanel.openPage(url);
            }),
            commands.registerCommand("meltanoPowerUser.addPlugin", async (item: MeltanoTreeItem) => {
                await this.meltanoClient.addPlugin(item.typ!, item.plugin.name, item.plugin.variant);
            }),
        );
    }

    dispose() {
        while (this.disposables.length) {
            const x = this.disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
}
