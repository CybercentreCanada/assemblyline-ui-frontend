import { AppRoot } from '@tui/core';
import { useAppConfig } from 'core/config';
import { i18n } from 'i18next';
import React, { PropsWithChildren } from 'react';
import { useAppLayoutThemeMode } from './layout.hooks';

export type AppLayoutProviderProps = PropsWithChildren & {
  i18n: i18n;
};

export const AppLayoutProvider = React.memo(({ children, i18n }: AppLayoutProviderProps) => {
  const autoHideAppbar = useAppConfig(s => s?.layout?.cookies?.autoHideAppbar);
  const density = useAppConfig(s => s?.layout?.cookies?.density);
  const drawerOpen = useAppConfig(s => s?.layout?.cookies?.drawerOpen);
  const lang = useAppConfig(s => s?.layout?.cookies?.lang);
  const layout = useAppConfig(s => s?.layout?.cookies?.layout);
  const showBreadcrumbs = useAppConfig(s => s?.layout?.cookies?.showBreadcrumbs);
  const showQuickSearch = useAppConfig(s => s?.layout?.cookies?.showQuickSearch);
  const theme = useAppConfig(s => s?.layout?.cookies?.theme);

  const mode = useAppLayoutThemeMode();

  return (
    <AppRoot
      cookies={{
        autoHideAppbar,
        density,
        drawerOpen,
        lang,
        layout,
        mode,
        showBreadcrumbs,
        showQuickSearch,
        theme
      }}
      i18n={i18n}
    >
      {children}
    </AppRoot>
  );
});
