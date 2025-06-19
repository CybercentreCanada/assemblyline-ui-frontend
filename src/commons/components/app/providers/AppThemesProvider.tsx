import { CssBaseline, ThemeProvider, useMediaQuery, type PaletteMode } from '@mui/material';
import type {} from '@mui/material/themeCssVarsAugmentation';
import type { AppPreferenceConfigs, AppTheme, AppThemeConfigs } from 'commons/components/app/AppConfigs';
import { AppStorageKeys } from 'commons/components/app/AppConstants';
import { AppDefaultsPreferencesConfigs } from 'commons/components/app/AppDefaults';
import useLocalStorageItem from 'commons/components/utils/hooks/useLocalStorageItem';
import useThemeBuilder from 'commons/components/utils/hooks/useThemeBuilder';
import { createContext, useCallback, useMemo, useEffect, type FC, type PropsWithChildren } from 'react';

const { LS_KEY_AUTO_DETECT_COLOR_SCHEME, LS_KEY_THEME, LS_KEY_DARK_MODE } = AppStorageKeys;

export type AppThemeContextProps = {
  current: AppThemeConfigs;
  mode: PaletteMode;
  autoDetectColorScheme?: boolean;
  themes?: AppTheme[];
  setTheme: (id: string) => void;
  toggleMode: () => void;
  toggleAutoDetectColorScheme: () => void;
};

export const AppThemesContext = createContext<AppThemeContextProps>({
  current: {},
  mode: 'dark',
  autoDetectColorScheme: true,
  setTheme: () => null,
  toggleMode: () => null,
  toggleAutoDetectColorScheme: () => null,
});

export const AppThemesProvider: FC<
  PropsWithChildren & { initTheme?: AppThemeConfigs; themes?: AppTheme[]; preferences?: AppPreferenceConfigs }
> = ({ initTheme, themes, preferences, children }) => {
  // Since we can't useAppConfig yet, we explicitly merge default and preferences config
  //  to help figure the default theme mode.
  const { allowThemeSelection, autoDetectColorScheme, defaultTheme } = { ...AppDefaultsPreferencesConfigs, ...(preferences || {}) };

  // Store theme state in local storage.
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useLocalStorageItem(
    LS_KEY_DARK_MODE,
    ((defaultTheme ?? prefersDarkMode) ? 'dark' : 'light') as PaletteMode
  );
  const [autoDetectCS, setAutoDetectCS] = useLocalStorageItem(LS_KEY_AUTO_DETECT_COLOR_SCHEME, !!autoDetectColorScheme);

  // Effect to update darkMode based on system preference
  useEffect(() => {
    if (autoDetectCS && allowThemeSelection) {
      setMode(prefersDarkMode ? 'dark' : 'light');
    }
  }, [autoDetectCS, prefersDarkMode, allowThemeSelection]);

  // Enforce default theme if selection isn't allowed.
  const _darkMode = allowThemeSelection ? mode === 'dark' : defaultTheme === 'dark';

  // Callback to toggle theme auto detecting
  const toggleAutoDetectColorScheme = useCallback(() => setAutoDetectCS(!autoDetectCS), [autoDetectCS, setAutoDetectCS]);
  const toggleMode = useCallback(() => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  }, [mode, setMode]);

  const [current, setCurrent] = useLocalStorageItem<string>(
    LS_KEY_THEME,
    // Initialize local storage attribute.
    // 1: If a list of theme is provided:
    //  1.1: pick the default's id.
    //  1.2: no default, pick the first's id.
    // 2: Else don't set a value in local storage.
    themes?.length > 0 ? themes?.find(_theme => _theme.default)?.id || themes[0].id : null
  );

  const currentTheme = useMemo(() => {
    // Use the legacy default theme if only the `
    if (!current && initTheme) {
      return initTheme;
    }

    // Find the theme to apply.

    // 1: Attempt to find the previous theme selection.
    if (themes[current]) {
      return themes[current].configs;
    }

    // Handle cases where the local storage value doesn't match any provided themes.

    // 2: Attempt to find the default in the list of themes.
    const defaultTheme = themes?.find(_theme => _theme.default);
    if (defaultTheme) {
      return defaultTheme.configs;
    }

    // 3: Pick the first from the list of themes.
    if (themes?.length > 0) {
      return themes[0].configs;
    }

    // 4: Pick the legacy theme method provided by `initTheme
    if (initTheme) {
      return initTheme;
    }

    // Tell the dev that themes are misconfigured in AppProvider.
    throw Error(
      "******* No themes found.  Please configure themes through the AppProvider's 'themes' property. *******"
    );
  }, [current, themes, initTheme]);

  // Create MUI Themes.
  const { lightTheme, darkTheme } = useThemeBuilder(currentTheme);

  const context = useMemo(
    () => ({
      current: currentTheme,
      autoDetectColorScheme: autoDetectCS,
      themes,
      mode,
      toggleMode,
      toggleAutoDetectColorScheme,
      setTheme: (id: string) => {
        setCurrent(id);
      }
    }),
    [currentTheme, autoDetectCS, themes, mode, toggleAutoDetectColorScheme, toggleMode, setCurrent]
  );

  return (
    <AppThemesContext.Provider value={context}>
      <ThemeProvider theme={_darkMode ? darkTheme : lightTheme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </AppThemesContext.Provider>
  );
};
