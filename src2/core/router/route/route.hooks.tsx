import { AppRoute } from 'app/app.routes';
import { useRouteStore } from './route.providers';

//*****************************************************************************************
// useRoute
//*****************************************************************************************
export type AppRouteStore<Route extends AppRoute> = {
  params: Route['params']['type'];
  // search: Route['search'];
  // hash: Route['hash'];
};

// TODO: use the path instead of inferring the type

export function useRoute<const Route extends AppRoute>() {
  return function <const SelectorOutput>(selector: (store: AppRouteStore<Route>) => SelectorOutput) {
    const context = useRouteStore<SelectorOutput>(selector);
    if (!context) return null;
    return context[0];
  };
}
