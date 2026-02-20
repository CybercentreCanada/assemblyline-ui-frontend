type RegisteredRoute = {
  path: string;
};

const routeRegistry = new Map<string, RegisteredRoute>();

export const registerRoute = <T extends RegisteredRoute>(route: T) => {
  routeRegistry.set(route.path, route);
  return route;
};

export const getRegisteredRoutes = () => {
  return Array.from(routeRegistry.values());
};

export const clearRegisteredRoutes = () => {
  routeRegistry.clear();
};
