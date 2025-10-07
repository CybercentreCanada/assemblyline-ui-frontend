import { PARAM_BLUEPRINTS } from 'components/core/SearchParams/lib/search_params.blueprint';
import type { SearchParamBlueprints, SearchParamValues } from 'components/core/SearchParams/lib/search_params.model';
import { createSearchParamsStore } from 'components/core/SearchParams/lib/search_params.store';

export type SearchParams<Blueprints extends SearchParamBlueprints> = SearchParamValues<Blueprints>;

export const createSearchParams = <Blueprints extends SearchParamBlueprints>(
  input: (blueprints: typeof PARAM_BLUEPRINTS) => Blueprints
) => input(PARAM_BLUEPRINTS);

export const { SearchParamsProvider, useSearchParams } = createSearchParamsStore();
