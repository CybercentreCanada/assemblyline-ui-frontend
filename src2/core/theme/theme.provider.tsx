import { createTheme, CssBaseline, StyledEngineProvider, ThemeProvider, useMediaQuery } from '@mui/material';
import { deepmerge } from '@mui/utils';
import { APP_THEMES } from 'app/app.themes';
import { useAppConfig } from 'core/config';
import type { AppThemeConfigs } from 'core/theme/theme.models';
import React, { PropsWithChildren, useMemo } from 'react';

const DEFAULT_THEME_VARIANT = 'default';

const mergeThemeConfigs = (configs: AppThemeConfigs, mode: 'light' | 'dark') => {
  const globalConfigs = configs.global ?? {};
  const modeConfigs = mode === 'dark' ? (configs.dark ?? {}) : (configs.light ?? {});

  return deepmerge(globalConfigs, modeConfigs);
};

export const AppThemeProvider = React.memo(({ children }: PropsWithChildren) => {
  const injectFirst = useAppConfig(s => s.theme.injectFirst ?? false);
  const requestedMode = useAppConfig(s => s.theme.mode);
  const variant = useAppConfig(s => (s.theme.variant in APP_THEMES ? s.theme.variant : DEFAULT_THEME_VARIANT));

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const resolvedMode = useMemo(
    () => (requestedMode === 'system' ? (prefersDarkMode ? 'dark' : 'light') : requestedMode),
    [requestedMode, prefersDarkMode]
  );

  const theme = useMemo(
    () =>
      createTheme(mergeThemeConfigs((APP_THEMES[variant] ?? APP_THEMES[DEFAULT_THEME_VARIANT]).configs, resolvedMode)),
    [resolvedMode, variant]
  );

  return (
    <StyledEngineProvider injectFirst={injectFirst}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
});

AppThemeProvider.displayName = 'AppThemeProvider';
