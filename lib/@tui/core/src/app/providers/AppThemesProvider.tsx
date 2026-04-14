import { ThemeProvider, type PaletteMode } from '@mui/material';
import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type Dispatch,
  type FC,
  type PropsWithChildren,
  type SetStateAction
} from 'react';
import { useCookiesStore } from '../../cookies/hooks/useCookiesStore';
import { useAppThemeBuilder } from '../../themes/hooks/useAppThemeBuilder';
import type { AppTheme, AppThemeConfigs } from '../AppConfigs';
import type { AppContextBase } from '../AppContexts';

export type TuiThemesContextType = AppContextBase & {
  current: AppTheme;
  mode: PaletteMode;
  themes?: AppTheme[];
  optionsOverride: Partial<AppThemeConfigs>;
  setTheme: (id: string) => void;
  setOptionsOverride: Dispatch<SetStateAction<AppThemeConfigs>>;
  toggleMode: () => void;
};

export const TuiThemesContext = createContext<TuiThemesContextType>({
  initialized: false,
  current: null,
  mode: null,
  themes: null,
  optionsOverride: null,
  setTheme: () => null,
  setOptionsOverride: () => null,
  toggleMode: () => null
});

type TuiThemesProviderProps = PropsWithChildren & {
  initTheme?: AppTheme;
  themes: AppTheme[];
};

export const AppThemesProvider: FC<TuiThemesProviderProps> = ({ initTheme, themes, children }) => {
  const themeCookie = useCookiesStore(state => state.theme);
  const modeCookie = useCookiesStore(state => state.mode);
  const densityCookie = useCookiesStore(state => state.density);
  const setModeCookie = useCookiesStore(state => state.setMode);
  const setThemeCookie = useCookiesStore(state => state.setTheme);

  //
  const themeBuilder = useAppThemeBuilder();

  // Provide the ability to inject custom theme options.
  // These will be merged with the default app and tui theme options.
  const [optionsOverride, setOptionsOverride] = useState<Partial<AppThemeConfigs>>();

  //
  const current = useMemo(() => {
    // 1: Attempt to find the previous theme selection.
    const selectedTheme = themes.find(t => t.id === themeCookie);
    if (selectedTheme) {
      return selectedTheme;
    }

    // 2: Attempt to find the default in the list of themes.
    const defaultTheme = themes.find(t => t.default);
    if (defaultTheme) {
      return defaultTheme;
    }

    // 3: Pick the first from the list of themes.
    if (themes?.length > 0) {
      return themes[0];
    }

    // 4: Pick the legacy theme method provided by `initTheme
    if (initTheme) {
      return initTheme;
    }

    throw Error('******* No themes found. *******');
  }, [initTheme, themes, themeCookie]);

  // Build the mui themes according the current selection.
  const { lightTheme, darkTheme } = useMemo(
    () => themeBuilder(current, optionsOverride, densityCookie),
    [themeBuilder, current, optionsOverride, densityCookie]
  );

  // Pick the appropriate mode.
  const theme = useMemo(() => {
    if (modeCookie === 'dark') {
      return darkTheme;
    } else if (modeCookie === 'light') {
      return lightTheme;
    } else {
      return darkTheme;
    }
  }, [darkTheme, lightTheme, modeCookie]);

  // Callback to toggle theme.
  const toggleMode = useCallback(() => {
    setModeCookie(modeCookie === 'dark' ? 'light' : 'dark');
  }, [modeCookie, setModeCookie]);

  // Memoized context value.
  const context = useMemo(
    () => ({
      initialized: true,
      current,
      themes,
      optionsOverride,
      mode: modeCookie as PaletteMode,
      setTheme: (id: string) => {
        setThemeCookie(id);
      },
      setOptionsOverride,
      toggleMode
    }),
    [current, modeCookie, optionsOverride, themes, toggleMode, setThemeCookie, setOptionsOverride]
  );

  return (
    <TuiThemesContext.Provider value={context}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </TuiThemesContext.Provider>
  );
};
