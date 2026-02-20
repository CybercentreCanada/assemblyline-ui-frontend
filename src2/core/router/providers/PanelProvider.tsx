import React, { createContext, useContext } from 'react';

export type RoutePanel = number;

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

export const usePanel = (): PanelContextValue => {
  return useContext(PanelContext) ?? { panel: 0 };
};
