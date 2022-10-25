import { Disposable, ExtensionContext, window } from "vscode";
import { TreeviewProviders } from "./treeview_provider";
import { WebviewViewProviders } from "./webviewview_provider";
import { provideSingleton } from "./utils";

@provideSingleton(MeltanoPowerUserExtension)
export class MeltanoPowerUserExtension implements Disposable {
    static meltanoMode = { language: "yaml", scheme: "file" };
    private disposables: Disposable[] = [];

    constructor(
        private treeviewProviders: TreeviewProviders,
        private webviewviewProviders: WebviewViewProviders,
    ) {
        this.disposables.push(
            this.treeviewProviders,
            this.webviewviewProviders,
        );
    }

    dispose() {
        this.disposables.forEach(disposable => disposable.dispose());
    }

    async activate(context: ExtensionContext): Promise<void> {
        window.showInformationMessage("Meltano Power User Extension Activated");
    }
}
