import { CssBaseline, PaletteMode, StyledEngineProvider, ThemeProvider, useMediaQuery } from '@mui/material';
import { AppPreferenceConfigs, AppSiteMapConfigs, AppThemeConfigs } from 'commons/components/app/AppConfigs';
import useLocalStorageItem from 'commons/components/utils/hooks/useLocalStorageItem';
import CarouselProvider from 'components/providers/CarouselProvider';
import DrawerProvider from 'components/providers/DrawerProvider';
import { ExternalLookupProvider } from 'components/providers/ExternalLookupProvider';
import HighlightProvider from 'components/providers/HighlightProvider';
import i18n from 'i18n';
import { createContext, ReactNode, useCallback, useMemo } from 'react';
import useThemeBuilder from '../utils/hooks/useThemeBuilder';
import { AppStorageKeys } from './AppConstants';
import { AppContextType } from './AppContexts';
import { AppDefaultsPreferencesConfigs } from './AppDefaults';
import { AppSearchService } from './AppSearchService';
import { AppUser, AppUserService } from './AppUserService';
import AppBarProvider from './providers/AppBarProvider';
import { AppErrorProvider } from './providers/AppErrorProvider';
import AppLayoutProvider from './providers/AppLayoutProvider';
import AppLeftNavProvider from './providers/AppLeftNavProvider';
import AppSnackbarProvider from './providers/AppSnackbarProvider';
import AppUserProvider from './providers/AppUserProvider';

const { LS_KEY_DARK_MODE } = AppStorageKeys;

export type AppProviderProps<U extends AppUser> = {
  preferences?: AppPreferenceConfigs;
  theme?: AppThemeConfigs;
  sitemap?: AppSiteMapConfigs;
  user?: AppUserService<U>;
  search?: AppSearchService;
  children: ReactNode;
};

export const AppContext = createContext<AppContextType>(null);

export default function AppProvider<U extends AppUser>({
  theme,
  user,
  search,
  sitemap,
  preferences,
  children
}: AppProviderProps<U>) {
  // Since we can't useAppConfig yet, we explicitly merge default and preferences config
  //  to help figure the default theme mode.
  const { allowThemeSelection, defaultTheme } = { ...AppDefaultsPreferencesConfigs, ...(preferences || {}) };

  // Store theme state in local storage.
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [darkMode, setDarkMode] = useLocalStorageItem(LS_KEY_DARK_MODE, defaultTheme === 'dark' || prefersDarkMode);

  // Enforce default theme if selection isn't alloweed.
  const _darkMode = allowThemeSelection ? darkMode : defaultTheme === 'dark';

  // Create MUI Themes.
  const { lightTheme, darkTheme } = useThemeBuilder(theme);

  // Callback to toggle theme.
  const toggleTheme = useCallback(() => setDarkMode(!darkMode), [darkMode, setDarkMode]);

  // Callback to toggle language.
  const toggleLanguage = useCallback(() => i18n.changeLanguage(i18n.language === 'en' ? 'fr' : 'en'), []);

  // Memoize context value to prevent extraneous renders on components that use it.
  const contextValue = useMemo(() => {
    return {
      theme: (darkMode ? 'dark' : 'light') as PaletteMode,
      configs: { preferences, theme, sitemap },
      toggleTheme,
      toggleLanguage
    };
  }, [darkMode, preferences, theme, sitemap, toggleTheme, toggleLanguage]);

  return (
    <AppContext.Provider value={contextValue}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={_darkMode ? darkTheme : lightTheme}>
          <CssBaseline />
          <AppErrorProvider>
            <AppSnackbarProvider>
              <AppUserProvider service={user}>
                <HighlightProvider>
                  <ExternalLookupProvider>
                    <CarouselProvider>
                      <DrawerProvider>
                        <AppBarProvider search={search}>
                          <AppLeftNavProvider>
                            <AppLayoutProvider>{children}</AppLayoutProvider>
                          </AppLeftNavProvider>
                        </AppBarProvider>
                      </DrawerProvider>
                    </CarouselProvider>
                  </ExternalLookupProvider>
                </HighlightProvider>
              </AppUserProvider>
            </AppSnackbarProvider>
          </AppErrorProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    </AppContext.Provider>
  );
}
