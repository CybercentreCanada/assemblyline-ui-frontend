import type { AppSwitcherItem } from 'core/template/components/app/AppConfigs';
import { AppSwitcherContext } from 'core/template/components/app/AppContexts';
import { useAppConfigs } from 'core/template/components/app/hooks';
import { type ReactNode, useMemo, useState } from 'react';

type AppSwitcherProviderProps = {
  children: ReactNode;
};

export default function AppSwitcherProvider({ children }: AppSwitcherProviderProps) {
  const { preferences } = useAppConfigs();
  const [items, setItems] = useState<AppSwitcherItem[]>(preferences.topnav.apps || []);
  const context = useMemo(() => ({ items, empty: !items || items.length === 0, setItems }), [items]);
  return <AppSwitcherContext.Provider value={context}>{children}</AppSwitcherContext.Provider>;
}
