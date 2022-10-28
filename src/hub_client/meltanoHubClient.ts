import fetch from 'node-fetch';

import {
    ExtractorResponse,
    LoaderResponse,
    PluginIndexResponse,
    PluginResponse,
    PluginType,
    UtilityResponse,
    TransformerResponse,
    OrchestratorResponse,
    FilesResponse
} from '../domain';

/**  Base URL for Meltano Hub */
const BASE_URL = "https://hub.meltano.com/meltano/api/v1";

/**  Gets index data for all plugins of the specified type */
async function getPlugins(type: PluginType): Promise<PluginIndexResponse> {
    return meltanoFetch(`${BASE_URL}/plugins/${type}/index`);
}

/**  Gets data for a specific plugin */
async function getPluginData(type: PluginType, name: string, variant: string): Promise<PluginResponse> {
    const endpoint = `${BASE_URL}/plugins/${type}/${name}--${variant}`;
    switch (type) {
        case PluginType.extractor: return meltanoFetch<ExtractorResponse>(endpoint);
        case PluginType.loader: return meltanoFetch<LoaderResponse>(endpoint);
        case PluginType.utility: return meltanoFetch<UtilityResponse>(endpoint);
        case PluginType.transformer: return meltanoFetch<TransformerResponse>(endpoint);
        case PluginType.orchestrator: return meltanoFetch<OrchestratorResponse>(endpoint);
        case PluginType.files: return meltanoFetch<FilesResponse>(endpoint);
    }
}

/**  A generic function for fetching data from 
 * Meltano Hub API with a known URL */
async function meltanoFetch<T>(endpoint: string): Promise<T> {
    const resp = await fetch(endpoint);
    return await resp.json() as T;
}

export {
    meltanoFetch,
    getPlugins,
    getPluginData,
    BASE_URL
};
