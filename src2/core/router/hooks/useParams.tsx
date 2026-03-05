import { AppRoute } from 'app/app.routes';
import { useRouteStore } from '../providers/RouteProvider';

type InferParams<Route> = Route extends { params: infer Params } ? Params : Record<string, string>;

export type UseParamsProps<Params extends Record<string, string>> = Params;

export const useParams = function <const Route extends AppRoute>() {
  return function <const SelectorOutput extends unknown>(input: (store: Route['params']) => SelectorOutput) {
    return useRouteStore(s => input(s.params))[0];
  };
};
