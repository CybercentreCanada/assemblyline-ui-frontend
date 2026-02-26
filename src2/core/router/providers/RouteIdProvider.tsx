import React, { createContext, useContext } from 'react';

export type RouteIDContextValue = {
  routeKey: string;
};

const RouteIDContext = createContext<RouteIDContextValue | null>(null);

RouteIDContext.displayName = 'RouteIDContext';

export type RouteIDProviderProps = {
  routeKey: string;
  children: React.ReactNode;
};

export const RouteIDProvider = React.memo(({ routeKey, children }: RouteIDProviderProps) => {
  return <RouteIDContext.Provider value={{ routeKey }}>{children}</RouteIDContext.Provider>;
});

RouteIDProvider.displayName = 'RouteIDProvider';

export const useRouteID = (): RouteIDContextValue => {
  return useContext(RouteIDContext) ?? { routeKey: null };
};
