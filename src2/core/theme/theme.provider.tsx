import type { ThemeProviderProps } from '@mui/material';
import { createTheme, CssBaseline, StyledEngineProvider, ThemeProvider, useMediaQuery } from '@mui/material';
import { useAppInterfaceStore, useAppSetInterfaceStore } from 'core/interface';
import { useAppPreferenceStore } from 'core/preference';
import type { PropsWithChildren } from 'react';
import { memo, useEffect, useMemo } from 'react';
import { mergeThemeConfigs } from './theme.utils';

//*****************************************************************************************
// App Theme Provider
//*****************************************************************************************
export const AppThemeProvider = memo(({ children }: PropsWithChildren) => {
  const requestedMode = useAppPreferenceStore(s => s.theme.mode);

  const initialized = useAppInterfaceStore(s => s.theme.initialized);
  const injectFirst = useAppInterfaceStore(s => s.theme.injectFirst);
  const skin = useAppInterfaceStore(s => s.theme.skin);

  const setTheme = useAppSetInterfaceStore();

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
      .then(response => response.json() as Promise<unknown>)
      .then(data =>
        setTheme(s => {
          s.theme.initialized = true;
          s.theme.skin = {
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
