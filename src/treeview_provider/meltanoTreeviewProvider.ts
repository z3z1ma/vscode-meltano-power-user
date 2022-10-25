import {
  TreeDataProvider,
  TreeItem,
  Event,
  TreeItemCollapsibleState,
  window,
  EventEmitter,
  Disposable,
  Uri,
  MarkdownString,
} from "vscode";
import { unmanaged } from "inversify";
import { provideSingleton } from "../utils";
import { provide } from "inversify-binding-decorators";

import {
  Plugin,
  PluginType,
  pluginTypeMap,
} from "../domain";
import { getPlugins, getPluginData } from "../hub_client/meltanoHubClient";

function makeTooltip(plugin: Plugin): MarkdownString {
  return new MarkdownString(`
### [${plugin.name}](${plugin.url}) (${plugin.variant} variant)
${plugin.description ?? 'No description provided'}

![contributors](https://img.shields.io/github/contributors/${plugin.variant}/${plugin.name})
![commits](https://img.shields.io/github/commit-activity/m/${plugin.variant}/${plugin.name})

#### Repo
${plugin.repo}`);
}

class MeltanoTreeItem extends TreeItem {
  plugin: Plugin;

  constructor(plugin: Plugin, isVariant: boolean = false) {
    super(plugin.variant);
    this.plugin = plugin;
    if (plugin.url !== undefined) {
      if (isVariant) {
        this.collapsibleState = TreeItemCollapsibleState.None;
        this.description = plugin.description;
        this.tooltip = makeTooltip(plugin);
        this.command = {
          command: "vscode.open",
          title: "Open in Meltano Hub",
          arguments: [Uri.parse(plugin.url)],
        };
        if (plugin.variant === plugin.defaultVariant) {
          this.label += " ⭐️";
        }
      } else {
        this.collapsibleState = TreeItemCollapsibleState.Collapsed;
        this.iconPath = Uri.parse(plugin.url);
      }
    }
  }
}

class ExtractorTreeItem extends MeltanoTreeItem {
  contextValue = PluginType.extractor;
}

class LoaderTreeItem extends MeltanoTreeItem {
  contextValue = PluginType.loader;
}

class UtilityTreeItem extends MeltanoTreeItem {
  contextValue = PluginType.utility;
}

class TransformerTreeItem extends MeltanoTreeItem {
  contextValue = PluginType.transformer;
}

class OrchestratorTreeItem extends MeltanoTreeItem {
  contextValue = PluginType.orchestrator;
}

const treeItemMap = {
  [PluginType.extractor]: ExtractorTreeItem,
  [PluginType.loader]: LoaderTreeItem,
  [PluginType.utility]: UtilityTreeItem,
  [PluginType.transformer]: TransformerTreeItem,
  [PluginType.orchestrator]: OrchestratorTreeItem
};

@provide(MeltanoTreeviewProvider)
abstract class MeltanoTreeviewProvider implements TreeDataProvider<MeltanoTreeItem>, Disposable {
  private _onDidChangeTreeData: EventEmitter<MeltanoTreeItem | undefined | void>
    = new EventEmitter<MeltanoTreeItem | undefined | void>();
  readonly onDidChangeTreeData: Event<MeltanoTreeItem | undefined | void>
    = this._onDidChangeTreeData.event;
  private disposables: Disposable[] = [this._onDidChangeTreeData];

  constructor(
    @unmanaged() private treeType: PluginType
  ) {
    this.treeType = treeType;
    this.disposables.push(
      window.onDidChangeActiveTextEditor(() => {
        this._onDidChangeTreeData.fire();
      })
    );
  }

  dispose() {
    this.disposables.forEach((disposable) => disposable.dispose());
  }

  getTreeItem(element: MeltanoTreeItem): MeltanoTreeItem | Thenable<MeltanoTreeItem> {
    return element;
  }

  getChildren(element?: MeltanoTreeItem): MeltanoTreeItem[] | Thenable<MeltanoTreeItem[]> {
    if (element && !element.plugin.variants) {
      return Promise.resolve([]);
    }
    return Promise.resolve(
      this.getTreeItems(element)
    );
  }

  private async getTreeItems(
    basePlugin?: MeltanoTreeItem,
  ): Promise<MeltanoTreeItem[]> {
    let treeItems: MeltanoTreeItem[] = [];
    if (basePlugin) {
      // Variants
      const variants = basePlugin.plugin.variants;
      for (let variant in variants) {
        const pluginDetails = await getPluginData(this.treeType, basePlugin.label!.toString(), variant);
        const parsedPlugin = new pluginTypeMap[this.treeType]({
          name: basePlugin.plugin.name,
          variant: variant,
          defaultVariant: basePlugin.plugin.defaultVariant ?? basePlugin.plugin.name,
          description: pluginDetails.description,
          repo: pluginDetails.repo,
          url: pluginDetails.docs,
        });
        treeItems.push(new treeItemMap[this.treeType](parsedPlugin, true));
      }
    } else {
      // Root
      const plugins = await getPlugins(this.treeType);
      for (let plugin in plugins) {
        const parsedPlugin = new pluginTypeMap[this.treeType]({
          name: plugin,
          variant: plugin,
          url: plugins[plugin].logo_url,
          defaultVariant: plugins[plugin].default_variant,
          variants: plugins[plugin].variants,
        });
        treeItems.push(new treeItemMap[this.treeType](parsedPlugin));
      }
    }
    return treeItems;
  }
}

@provideSingleton(ExtractorTreeView)
export class ExtractorTreeView extends MeltanoTreeviewProvider {
  constructor() {
    super(PluginType.extractor);
  }
}

@provideSingleton(LoaderTreeView)
export class LoaderTreeView extends MeltanoTreeviewProvider {
  constructor() {
    super(PluginType.loader);
  }
}

@provideSingleton(UtilityTreeView)
export class UtilityTreeView extends MeltanoTreeviewProvider {
  constructor() {
    super(PluginType.utility);
  }
}

@provideSingleton(TransformerTreeView)
export class TransformerTreeView extends MeltanoTreeviewProvider {
  constructor() {
    super(PluginType.transformer);
  }
}

@provideSingleton(OrchestratorTreeView)
export class OrchestratorTreeView extends MeltanoTreeviewProvider {
  constructor() {
    super(PluginType.orchestrator);
  }
}
