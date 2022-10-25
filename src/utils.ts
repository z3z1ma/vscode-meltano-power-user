import { fluentProvide } from "inversify-binding-decorators";
import {
    FileSystemWatcher,
    Disposable,
} from "vscode";

export const debounce = (fn: () => void, wait: number) => {
    let timeout: NodeJS.Timeout;
    return () => {
        clearTimeout(timeout);
        timeout = setTimeout(fn, wait);
    };
};

export const setupWatcherHandler: (
    watcher: FileSystemWatcher,
    handler: Function
) => Disposable[] = (watcher, handler) => [
    watcher.onDidChange(() => handler()),
    watcher.onDidCreate(() => handler()),
    watcher.onDidDelete(() => handler()),
];

export const provideSingleton = (identifier: any) => {
    return fluentProvide(identifier).inSingletonScope().done();
};
