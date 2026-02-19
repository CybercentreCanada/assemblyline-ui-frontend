import type { AnyTypedRoute } from '../models/router.models';

const routeRegistry = new Map<string, AnyTypedRoute>();

export const registerRoute = <Path extends string>(route: AnyTypedRoute<Path>) => {
  routeRegistry.set(route.path, route);
  return route;
};

export const getRegisteredRoutes = () => {
  return Array.from(routeRegistry.values());
};

export const clearRegisteredRoutes = () => {
  routeRegistry.clear();
};
