import { createTheme, CssBaseline, StyledEngineProvider, ThemeProvider, useMediaQuery } from '@mui/material';
import { deepmerge } from '@mui/utils';
import { useAppConfig } from 'core/config';
import type { AppThemeConfigs } from 'core/theme/theme.models';
import React, { PropsWithChildren, useMemo } from 'react';
import { useAppTheme } from './theme.hooks';

const mergeThemeConfigs = (configs: AppThemeConfigs, mode: 'light' | 'dark') => {
  const globalConfigs = configs.global ?? {};
  const modeConfigs = mode === 'dark' ? (configs.dark ?? {}) : (configs.light ?? {});

  return deepmerge(globalConfigs, modeConfigs);
};

export const AppThemeProvider = React.memo(({ children }: PropsWithChildren) => {
  const injectFirst = useAppConfig(s => s.theme.injectFirst ?? false);
  const requestedMode = useAppConfig(s => s.theme.mode);
  const skin = useAppConfig(s => s?.theme?.skin);
  const initialized = useAppConfig(s => s?.theme?.initialized);

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  useAppTheme();

  const resolvedMode = useMemo(
    () => (requestedMode === 'system' ? (prefersDarkMode ? 'dark' : 'light') : requestedMode),
    [requestedMode, prefersDarkMode]
  );

  const theme = useMemo(() => createTheme(mergeThemeConfigs(skin?.configs ?? {}, resolvedMode)), [resolvedMode, skin]);

  return !initialized ? null : (
    <StyledEngineProvider injectFirst={injectFirst}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
});

AppThemeProvider.displayName = 'AppThemeProvider';
