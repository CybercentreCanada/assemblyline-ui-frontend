import type { PaletteMode } from '@mui/material';
import { CssBaseline, StyledEngineProvider, ThemeProvider, useMediaQuery } from '@mui/material';
import type { Localization } from '@mui/material/locale';
import type {} from '@mui/material/themeCssVarsAugmentation';
import { useAppConfigStore } from 'core/config/config.providers';
import { useAppPreferenceStore } from 'core/preference/preference.providers';
import { createStoreContext } from 'features/store/createStoreContext';
import React, { PropsWithChildren, useEffect, useMemo } from 'react';
import { DEFAULT_APP_THEME } from './theme.defaults';
import type { AppTheme } from './theme.models';
import { createAppTheme, DEFAULT_THEME_LOCALE, mergeAppTheme } from './theme.utils';

export type AppThemeMode = PaletteMode | 'system';

//*****************************************************************************************
// App Theme Store
//*****************************************************************************************
export type AppThemeStore = {
  autoDetectColorScheme: boolean;
  requestedMode: AppThemeMode;
  mode: PaletteMode;
  theme: AppTheme;
};

const createDefaultAppThemeStore = (): AppThemeStore => ({
  autoDetectColorScheme: true,
  requestedMode: 'system',
  mode: 'dark',
  theme: DEFAULT_APP_THEME
});

export const { StoreProvider: AppThemeStoreProvider, useStore: useAppThemeStore } =
  createStoreContext<AppThemeStore>(createDefaultAppThemeStore());

AppThemeStoreProvider.displayName = 'AppThemeStoreProvider';

//*****************************************************************************************
// App Theme Provider
//*****************************************************************************************
export type AppThemeProviderProps = PropsWithChildren & {
  autoDetectColorScheme?: boolean;
  injectFirst?: boolean;
  locale?: Localization;
  mode?: AppThemeMode;
  theme?: AppTheme;
};

export const useAppTheme = () => {
  const [state, setState] = useAppThemeStore(s => s);

  return {
    ...state,
    setAutoDetectColorScheme: (value: boolean) => setState({ autoDetectColorScheme: value }),
    setMode: (value: AppThemeMode) => setState({ requestedMode: value }),
    setTheme: (value: AppTheme) => setState({ theme: mergeAppTheme(value) }),
    toggleMode: () => setState(current => ({ requestedMode: current.mode === 'dark' ? 'light' : 'dark' }))
  };
};

type AppThemeRuntimeProps = {
  children: React.ReactNode;
  injectFirst: boolean;
  locale: Localization;
};

const AppThemeRuntime = React.memo(({ children, injectFirst, locale }: AppThemeRuntimeProps) => {
  const [state, setState] = useAppThemeStore(s => s);

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const resolvedMode = useMemo<PaletteMode>(() => {
    if (state.requestedMode === 'system') return prefersDarkMode ? 'dark' : 'light';
    if (state.autoDetectColorScheme) return prefersDarkMode ? 'dark' : 'light';
    return state.requestedMode;
  }, [prefersDarkMode, state.autoDetectColorScheme, state.requestedMode]);

  const muiTheme = useMemo(
    () =>
      createAppTheme(
        state.theme,
        {
          mode: resolvedMode,
          ...(resolvedMode === 'dark' ? state.theme.palette?.dark : state.theme.palette?.light)
        },
        locale
      ),
    [locale, resolvedMode, state.theme]
  );

  useEffect(() => {
    if (state.mode !== resolvedMode) setState({ mode: resolvedMode });
  }, [resolvedMode, setState, state.mode]);

  return (
    <StyledEngineProvider injectFirst={injectFirst}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
});

AppThemeRuntime.displayName = 'AppThemeRuntime';

export const AppThemeProvider = React.memo(
  ({
    autoDetectColorScheme = true,
    children,
    injectFirst = true,
    locale = DEFAULT_THEME_LOCALE,
    mode,
    theme
  }: AppThemeProviderProps) => {
    const [configTheme] = useAppConfigStore(s => s.theme);
    const [preferenceMode] = useAppPreferenceStore(s => s.theme?.mode);

    const requestedMode = useMemo(() => mode ?? configTheme ?? preferenceMode ?? 'system', []);

    const mergedTheme = useMemo(() => mergeAppTheme(theme), [theme]);

    const storeData = useMemo(
      () => ({
        autoDetectColorScheme,
        requestedMode,
        theme: mergedTheme
      }),
      [autoDetectColorScheme, mergedTheme, requestedMode]
    );

    return (
      <AppThemeStoreProvider data={storeData}>
        <AppThemeRuntime injectFirst={injectFirst} locale={locale}>
          {children}
        </AppThemeRuntime>
      </AppThemeStoreProvider>
    );
  }
);

AppThemeProvider.displayName = 'AppThemeProvider';
