import React, { createContext, useContext } from 'react';

export type RoutePanel = string;

export type PanelContextValue = {
  panel: string | null;
};

const PanelContext = createContext<PanelContextValue | null>(null);

PanelContext.displayName = 'PanelContext';

export type PanelProviderProps = {
  panel: string;
  children: React.ReactNode;
};

export const PanelProvider = React.memo(({ panel, children }: PanelProviderProps) => {
  return <PanelContext.Provider value={{ panel }}>{children}</PanelContext.Provider>;
});

PanelProvider.displayName = 'PanelProvider';

export const usePanel = (): PanelContextValue => {
  return useContext(PanelContext) ?? { panel: null };
};
