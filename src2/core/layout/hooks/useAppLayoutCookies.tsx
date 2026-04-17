import { useMediaQuery } from '@mui/material';
import { TuiCookies } from '@tui/core';
import { useAppConfig } from 'core/config';
import { useMemo } from 'react';

const useAppLayoutThemeMode = () => {
  const requestedMode = useAppConfig(s => s.layout.cookies.mode);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  return useMemo(
    () => (requestedMode === 'system' ? (prefersDarkMode ? 'dark' : 'light') : requestedMode),
    [requestedMode, prefersDarkMode]
  );
};

export const useAppLayoutCookies = (): TuiCookies => {
  const autoHideAppbar = useAppConfig(s => s.layout.cookies.autoHideAppbar);
  const density = useAppConfig(s => s.layout.cookies.density);
  const drawerOpen = useAppConfig(s => s.layout.cookies.drawerOpen);
  const lang = useAppConfig(s => s.layout.cookies.lang);
  const layout = useAppConfig(s => s.layout.cookies.layout);
  const mode = useAppLayoutThemeMode();
  const showBreadcrumbs = useAppConfig(s => s.layout.cookies.showBreadcrumbs);
  const showQuickSearch = useAppConfig(s => s.layout.cookies.showQuickSearch);
  const theme = useAppConfig(s => s.layout.cookies.theme);

  return useMemo(
    () => ({
      autoHideAppbar,
      density,
      drawerOpen,
      lang,
      layout,
      mode,
      showBreadcrumbs,
      showQuickSearch,
      theme
    }),
    []
  );
};
