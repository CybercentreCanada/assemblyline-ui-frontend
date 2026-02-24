import React, { createContext, useContext } from 'react';

export type RouteRouteID = string;

export type RouteIDContextValue = {
  routeId: string;
};

const RouteIDContext = createContext<RouteIDContextValue | null>(null);

export type RouteIDProviderProps = {
  routeId: string;
  children: React.ReactNode;
};

export const RouteIDProvider = ({ routeId, children }: RouteIDProviderProps) => {
  return <RouteIDContext.Provider value={{ routeId }}>{children}</RouteIDContext.Provider>;
};

export const useRouteID = (): RouteIDContextValue => {
  return useContext(RouteIDContext) ?? { routeId: null };
};
