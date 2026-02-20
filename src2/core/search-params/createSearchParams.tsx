import { PARAM_BLUEPRINTS } from './lib/search_params.blueprint';
import { SearchParamBlueprints, SearchParamValues } from './lib/search_params.model';
import { createSearchParamsStore } from './lib/search_params.store';

export type SearchParams<Blueprints extends SearchParamBlueprints> = SearchParamValues<Blueprints>;

export const createSearchParams = <Blueprints extends SearchParamBlueprints>(
  input: (blueprints: typeof PARAM_BLUEPRINTS) => Blueprints
) => input(PARAM_BLUEPRINTS);

export const { SearchParamsProvider, useSearchParams } = createSearchParamsStore();
