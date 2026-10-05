import { type ReactNode, useMemo, useState } from 'react';
import type { AppSwitcherItem } from 'deprecated/legacy/commons/components/app/AppConfigs';

import { useAppConfigs } from 'deprecated/legacy/commons/components/app/hooks';
import { AppSwitcherContext } from 'deprecated/legacy/commons/components/app/AppContexts';

type AppSwitcherProviderProps = {
  children: ReactNode;
};

export default function AppSwitcherProvider({ children }: AppSwitcherProviderProps) {
  const { preferences } = useAppConfigs();
  const [items, setItems] = useState<AppSwitcherItem[]>(preferences.topnav.apps || []);
  const context = useMemo(() => ({ items, empty: !items || items.length === 0, setItems }), [items]);
  return <AppSwitcherContext.Provider value={context}>{children}</AppSwitcherContext.Provider>;
}
