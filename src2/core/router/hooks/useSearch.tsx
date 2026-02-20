import { SearchParamValues } from 'core/search-params/lib/search_params.model';
import { CreateRouteReturn } from '../utils/createRoute';

export const useSearch = <Route extends CreateRouteReturn<string, {}, string>>() => {
  return null as SearchParamValues<Route['search']>;
};
