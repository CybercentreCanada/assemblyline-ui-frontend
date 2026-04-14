import { createContext, type FC, type ReactNode, useMemo, useState } from 'react';
import type { AppSwitcherItem } from '..';

export type AppSwitcherContextType = {
  initialized: boolean; // has the app switcher been initialized by the provider?
  empty: boolean; // is the items list empty?
  items: AppSwitcherItem[]; // the items to render in the app switcher.
  setItems: (items: AppSwitcherItem[]) => void; // updates the items rendered by the app switcher.
};

export const AppSwitcherContext = createContext<AppSwitcherContextType>({
  initialized: false,
  empty: true,
  items: [],
  setItems: () => []
});

type AppSwitcherProviderProps = {
  apps?: AppSwitcherItem[]; // The list of applications to display in the app-switcher.
  children: ReactNode;
};

export const AppSwitcherProvider: FC<AppSwitcherProviderProps> = ({ apps, children }) => {
  const [items, setItems] = useState<AppSwitcherItem[]>(apps || []);
  const context = useMemo(() => ({ initialized: true, items, empty: !items || items.length === 0, setItems }), [items]);
  return <AppSwitcherContext.Provider value={context}>{children}</AppSwitcherContext.Provider>;
};
