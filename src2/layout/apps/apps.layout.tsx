import { AppSwitcherProvider, useAppSwitcher } from '@tui/apps';
import { useAppConfig } from 'core/config';
import type { PropsWithChildren } from 'react';
import { memo, useEffect } from 'react';

export const AppAppsLayout = memo(({ children }: PropsWithChildren) => {
  const { items, setItems } = useAppSwitcher();

  const apps = useAppConfig(s => s?.configuration?.ui?.apps || []);

  useEffect(() => {
    setItems(apps);
  }, [apps]);

  return <AppSwitcherProvider apps={items}>{children}</AppSwitcherProvider>;
});

AppAppsLayout.displayName = 'AppAppsLayout';
