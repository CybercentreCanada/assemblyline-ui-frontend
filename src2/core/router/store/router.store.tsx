import type { AnyTypedRoute } from '../models/router.models';

const routeRegistry = new Map<string, AnyTypedRoute>();

export const registerRoute = (route: AnyTypedRoute) => {
  routeRegistry.set(route.path, route);
  return route;
};

export const getRegisteredRoutes = () => {
  return Array.from(routeRegistry.values());
};

export const clearRegisteredRoutes = () => {
  routeRegistry.clear();
};
