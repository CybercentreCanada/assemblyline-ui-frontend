import React, { createContext, useContext } from 'react';

export type RoutePanel = string;

export type PanelContextValue = {
  panel: string;
};

const PanelContext = createContext<PanelContextValue | null>(null);

export type PanelProviderProps = {
  panel: string;
  children: React.ReactNode;
};

export const PanelProvider = ({ panel, children }: PanelProviderProps) => {
  return <PanelContext.Provider value={{ panel }}>{children}</PanelContext.Provider>;
};

export const usePanel = (): PanelContextValue => {
  return useContext(PanelContext) ?? { panel: null };
};
