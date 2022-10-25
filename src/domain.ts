/** Meltano Hub API generic plugin index response */
interface PluginIndexResponse {
    [tap: string]: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        logo_url: string,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        default_variant: string,
        variants: {
            [variant: string]: {
                ref: string
            }
        }
    }
};

/** Meltano Hub API base plugin response defining common API fields */
interface BasePluginResponse {
    description: string,
    label: string,
    name: string,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    logo_url: string,
    namespace: string,
    variant: string,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    pip_url: string,
    repo: string,
    docs: string,
    settings: {
        [setting: string]: any
    }[]
};

/** Meltano Hub API extractor plugin response */
interface ExtractorResponse extends BasePluginResponse {
    type: PluginType.extractor
}

/** Meltano Hub API loader plugin response */
interface LoaderResponse extends BasePluginResponse {
    type: PluginType.loader
}

/** Meltano Hub API utility plugin response */
interface UtilityResponse extends BasePluginResponse {
    type: PluginType.utility
}

/** Meltano Hub API transformer plugin response */
interface TransformerResponse extends BasePluginResponse {
    type: PluginType.transformer
}

/** Meltano Hub API orchestrator plugin response */
interface OrchestratorResponse extends BasePluginResponse {
    type: PluginType.orchestrator
}

/** Meltano Hub API generic plugin response */
type PluginResponse =
    | ExtractorResponse
    | LoaderResponse
    | UtilityResponse
    | TransformerResponse
    | OrchestratorResponse;

/** This enum defines all supported Meltano plugin types */
enum PluginType {
    extractor = "extractors",
    loader = "loaders",
    utility = "utilities",
    transformer = "transformers",
    orchestrator = "orchestrators"
}

/** Data structure used to construct a {@link Plugin} object */
interface PluginData {
    name: string,
    url: string,
    variant: string,
    defaultVariant: string,
    description?: string,
    variants?: { [variant: string]: { ref: string; } },
    repo?: string,
}

/** A base class for plugins which is implemented by concrete classes
 * which extend this plugin. These extensions represent each plugin type.
 * Constructed via {@link PluginData}
 */
abstract class Plugin {
    protected type!: PluginType;
    public readonly name: string;
    public readonly variant: string;
    public readonly url: string;
    public readonly defaultVariant: string;
    public readonly description?: string;
    public readonly variants?: { [variant: string]: { ref: string; } };
    public readonly repo?: string;

    public constructor(protected args: PluginData) {
        const {
            name,
            url,
            variant,
            defaultVariant,
            description,
            variants,
            repo
        } = args;
        this.name = name;
        this.url = url;
        this.variant = variant;
        this.defaultVariant = defaultVariant;
        this.description = description;
        this.variants = variants;
        this.repo = repo;
    }
}

interface ExtractorData extends PluginData {}

class Extractor extends Plugin {
    type = PluginType.extractor;
    constructor(args: ExtractorData) {
        super(args);
    }
}

interface LoaderData extends PluginData {}

class Loader extends Plugin {
    type = PluginType.loader;
    constructor(args: LoaderData) {
        super(args);
    }
}

interface UtilityData extends PluginData {}

class Utility extends Plugin {
    type = PluginType.utility;
    constructor(args: UtilityData) {
        super(args);
    }
}

interface TransformerData extends PluginData {}

class Transformer extends Plugin {
    type = PluginType.transformer;
    constructor(args: TransformerData) {
        super(args);
    }
}

interface OrchestratorData extends PluginData {}

class Orchestrator extends Plugin {
    type = PluginType.orchestrator;
    constructor(args: OrchestratorData) {
        super(args);
    }
}

const pluginTypeMap = {
    [PluginType.extractor]: Extractor,
    [PluginType.loader]: Loader,
    [PluginType.utility]: Utility,
    [PluginType.transformer]: Transformer,
    [PluginType.orchestrator]: Orchestrator
};

export {
    PluginIndexResponse,
    PluginResponse,
    ExtractorResponse,
    LoaderResponse,
    UtilityResponse,
    TransformerResponse,
    OrchestratorResponse,
    pluginTypeMap,
    Plugin,
    Extractor,
    Loader,
    Utility,
    Transformer,
    Orchestrator,
    PluginType,
};
