import { Disposable, window } from "vscode";
import { provideSingleton } from "../utils";
import { ExtractorTreeView, LoaderTreeView, UtilityTreeView, TransformerTreeView, OrchestratorTreeView, FilesTreeView } from "./meltanoTreeviewProvider";

@provideSingleton(TreeviewProviders)
export class TreeviewProviders implements Disposable {
  private disposables: Disposable[] = [];

  constructor(
    private extractorTreeView: ExtractorTreeView,
    private loaderTreeView: LoaderTreeView,
    private utilityTreeView: UtilityTreeView,
    private transformerTreeView: TransformerTreeView,
    private orchestratorTreeView: OrchestratorTreeView,
    private filesTreeView: FilesTreeView,
  ) {
    this.disposables.push(
      window.registerTreeDataProvider(
        "extractor_treeview",
        this.extractorTreeView
      ),
      window.registerTreeDataProvider(
        "loader_treeview",
        this.loaderTreeView
      ),
      window.registerTreeDataProvider(
        "utility_treeview",
        this.utilityTreeView
      ),
      window.registerTreeDataProvider(
        "orchestrator_treeview",
        this.orchestratorTreeView
      ),
      window.registerTreeDataProvider(
        "transformer_treeview",
        this.transformerTreeView
      ),
      window.registerTreeDataProvider(
        "file_treeview",
        this.filesTreeView
      ),
    );
  }

  dispose() {
    this.disposables.forEach(disposable => disposable.dispose());
  }
}
