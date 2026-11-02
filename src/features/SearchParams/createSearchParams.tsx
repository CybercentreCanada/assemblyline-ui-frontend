import { PARAM_BLUEPRINTS } from 'features/search-params/search-params.blueprints';
import { createSearchParamsStore } from 'features/search-params/search-params.stores';
import type { SearchParamBlueprints, SearchParamValues } from 'features/SearchParams/lib/search_params.model';

export type SearchParams<Blueprints extends SearchParamBlueprints> = SearchParamValues<Blueprints>;

export const createSearchParams = <Blueprints extends SearchParamBlueprints>(
  input: (blueprints: typeof PARAM_BLUEPRINTS) => Blueprints
) => input(PARAM_BLUEPRINTS);

export const { SearchParamsProvider, useSearchParams } = createSearchParamsStore();
