import {
    commands,
    Disposable,
    ProgressLocation,
    Uri,
    WebviewView,
    WebviewViewProvider,
    WebviewViewResolveContext,
    WebviewOptions,
    CancellationToken,
    window,
    Webview,
    ColorThemeKind,
    workspace
} from "vscode";

import { readFileSync } from "fs";
import { provideSingleton } from "../utils";

@provideSingleton(MeltanoHubPanel)
export class MeltanoHubPanel implements WebviewViewProvider {
    public static readonly viewType = 'meltano_hub';

    private _disposables: Disposable[] = [];
    private _panel: WebviewView | undefined;

    public constructor() {}

    public async resolveWebviewView(
        panel: WebviewView,
        context: WebviewViewResolveContext,
        _token: CancellationToken
    ) {
        this._panel = panel;
        this.setupWebviewOptions(context);
        this.renderWebviewView(context);
        this.setupWebviewHooks(context);
        _token.onCancellationRequested(async () => {});
    }

    /** Sets options, note that retainContextWhen hidden is set on registration */
    private setupWebviewOptions(context: WebviewViewResolveContext) {
        this._panel!.title = "Hub";
        this._panel!.description = "Explore the hub and find components or documentation for your project";
        this._panel!.webview.options = <WebviewOptions>{ enableScripts: true };
    }

    /** Primary interface for WebviewView inbound communication */
    private setupWebviewHooks(context: WebviewViewResolveContext) {
        this._panel!.webview.onDidReceiveMessage(
            message => {
                // switch (message.command) {}
            }, null, this._disposables
        );
    }

    /** Renders webview content */
    private async renderWebviewView(context: WebviewViewResolveContext) {
        const webview = this._panel!.webview;
        this._panel!.webview.html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport"
             content="width=device-width, initial-scale=1">
        </head>
        <body>
          <iframe src="https://hub.meltano.com/" style="height: 100vh; width: 100%; border: none" />
        </body>
        </html>`;
    }

    /** Sends query result data to webview */
    private async openPage(
        url: string,
    ) {
        await this._panel!.webview.postMessage({
            command: "openPage",
        });
    }
}

/** Gets webview HTML */
function getHtml(webview: Webview, extensionUri: Uri) {
    let indexPath = getUri(webview, extensionUri, ['query_panel', 'index.html']);
    let resourceDir = getUri(webview, extensionUri, ['query_panel']);
    let theme = [ColorThemeKind.Light, ColorThemeKind.HighContrastLight].includes(window.activeColorTheme.kind)
        ? "light" : "dark";
    return readFileSync(indexPath.path).toString()
        .replace(/__ROOT__/g, resourceDir.toString())
        .replace(/__THEME__/g, theme)
        .replace(/__NONCE__/g, getNonce())
        .replace(/__CSPSOURCE__/g, webview.cspSource);
}

/** Used to enforce a secure CSP */
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

/** Utility method for generating webview Uris for resources */
function getUri(webview: Webview, extensionUri: Uri, pathList: string[]) {
    return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList));
}
