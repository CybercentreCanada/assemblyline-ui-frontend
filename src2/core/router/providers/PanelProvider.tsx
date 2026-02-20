import React, { createContext, useContext } from 'react';

export type RoutePanel = 'main' | 'drawer';

export type PanelContextValue = {
  panel: number;
};

const PanelContext = createContext<PanelContextValue | null>(null);

export type PanelProviderProps = {
  panel: number;
  children: React.ReactNode;
};

export const PanelProvider = ({ panel, children }: PanelProviderProps) => {
  return <PanelContext.Provider value={{ panel }}>{children}</PanelContext.Provider>;
};

export const usePanel = () => {
  const context = useContext(PanelContext);
  if (!context) {
    throw new Error('usePanel must be used inside PanelProvider');
  }
  return context;
};
