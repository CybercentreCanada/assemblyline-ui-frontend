import React, { createContext, useContext, useMemo } from 'react';

export type RoutePanel = 'main' | 'drawer';

export type RouteContextValue = {
  panel: RoutePanel;
};

const RouteContext = createContext<RouteContextValue | null>(null);

export type RouteProviderProps = {
  panel: RoutePanel;
  children: React.ReactNode;
};

export const RouteProvider = ({ panel, children }: RouteProviderProps) => {
  const value = useMemo<RouteContextValue>(() => ({ panel }), [panel]);
  return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>;
};

export const useRouteContext = () => {
  const context = useContext(RouteContext);
  if (!context) {
    throw new Error('useRouteContext must be used inside RouteProvider');
  }
  return context;
};

export const useOptionalRouteContext = () => {
  return useContext(RouteContext);
};
