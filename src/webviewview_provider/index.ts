import { Disposable, window } from "vscode";
import { provideSingleton } from "../utils";
import { MeltanoHubPanel } from "./meltanoHub";

@provideSingleton(WebviewViewProviders)
export class WebviewViewProviders implements Disposable {
    private disposables: Disposable[] = [];

    constructor(
        private meltanoHubPanel: MeltanoHubPanel,
    ) {
        this.disposables.push(
            window.registerWebviewViewProvider(
                MeltanoHubPanel.viewType,
                this.meltanoHubPanel,
                { webviewOptions: { retainContextWhenHidden: true } }
            )
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
