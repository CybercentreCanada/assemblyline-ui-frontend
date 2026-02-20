import { useParams as useRouterParams } from 'react-router';
import { useRoute } from '../providers/RouteProvider';

type InferParams<Route> = Route extends { params: infer Params } ? Params : Record<string, string>;

export type UseParamsProps<Params extends Record<string, string>> = Params;

export const useParams = <Route extends unknown = unknown>() => {
  const rawParams = useRouterParams() as Record<string, string | undefined>;
  const route = useRoute();

  if (route.params) return route.params.parse(rawParams) as InferParams<Route>;
  else return rawParams as InferParams<Route>;
};
