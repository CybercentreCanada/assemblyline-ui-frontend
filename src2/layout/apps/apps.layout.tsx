import { AppSwitcherProvider, useAppSwitcher } from '@tui/apps';
import { useAppConfig } from 'core/config';
import React, { PropsWithChildren, useEffect } from 'react';
export const AppAppsLayout = React.memo(({ children }: PropsWithChildren) => {
  const { items, setItems } = useAppSwitcher();

  const apps = useAppConfig(s => s?.configuration?.ui?.apps || []);

  useEffect(() => {
    setItems(apps);
    // return () => {
    //   setItems([]);
    // };
  }, [apps]);

  return <AppSwitcherProvider apps={items}>{children}</AppSwitcherProvider>;
});
