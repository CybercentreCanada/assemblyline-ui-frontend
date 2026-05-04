import type { ThemeProviderProps } from '@mui/material';
import { createTheme, CssBaseline, StyledEngineProvider, ThemeProvider, useMediaQuery } from '@mui/material';
import type { AppTheme } from '@tui/core';
import { useAppPreferenceStore } from 'core/preference';
import { createAppStore } from 'features/store/createAppStore';
import type { PropsWithChildren } from 'react';
import { memo, useEffect, useMemo } from 'react';
import { mergeThemeConfigs } from './theme.utils';

//*****************************************************************************************
// App Theme Store
//*****************************************************************************************

export type AppThemeStore = {
  initialized?: boolean;
  injectFirst?: boolean;
  skin?: AppTheme;
};

export const DEFAULT_APP_THEME_STORE: AppThemeStore = {
  initialized: false,
  injectFirst: false,
  skin: null
};

export const {
  StoreProvider: AppThemeStoreProvider,
  useStore: useAppThemeStore,
  useSetStore: useAppSetThemeStore
} = createAppStore<AppThemeStore>(DEFAULT_APP_THEME_STORE);

AppThemeStoreProvider.displayName = 'AppThemeStoreProvider';

//*****************************************************************************************
// App Theme Provider
//*****************************************************************************************
export const AppThemeProvider = memo(({ children }: PropsWithChildren) => {
  const requestedMode = useAppPreferenceStore(s => s.theme.mode);

  const initialized = useAppThemeStore(s => s.initialized);
  const injectFirst = useAppThemeStore(s => s.injectFirst);
  const skin = useAppThemeStore(s => s.skin);

  const setTheme = useAppSetThemeStore();

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const resolvedMode = useMemo<'light' | 'dark'>(
    () => (requestedMode === 'system' ? (prefersDarkMode ? 'dark' : 'light') : requestedMode),
    [requestedMode, prefersDarkMode]
  );

  const theme = useMemo<ThemeProviderProps['theme']>(
    () => createTheme(mergeThemeConfigs(skin?.configs ?? {}, resolvedMode)),
    [resolvedMode, skin]
  );

  useEffect(() => {
    fetch('/theme.json')
      .then(response => response.json())
      .then(data =>
        setTheme(s => {
          s.initialized = true;
          s.skin = {
            id: 'theme.default',
            i18nKey: 'theme.default.label',
            default: true,
            configs: data
          };

          return s;
        })
      )
      // eslint-disable-next-line no-console
      .catch(error => console.error('Error fetching the JSON theme file:', error));
  }, []);

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
