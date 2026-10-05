import { PARAM_BLUEPRINTS } from 'features/search-params/search-params.blueprints.tsx';
import type { SearchParamBlueprints, SearchParamValues } from 'deprecated/legacy/components/core/SearchParams/lib/search_params.model.tsx';
import { createSearchParamsStore } from 'features/search-params/search-params.stores.tsx';

export type SearchParams<Blueprints extends SearchParamBlueprints> = SearchParamValues<Blueprints>;

export const createSearchParams = <Blueprints extends SearchParamBlueprints>(
  input: (blueprints: typeof PARAM_BLUEPRINTS) => Blueprints
) => input(PARAM_BLUEPRINTS);

export const { SearchParamsProvider, useSearchParams } = createSearchParamsStore();
