import { BorealisProvider } from 'borealis-ui';
import type {
  AppOverrideConfigs,
  AppPreferenceConfigs,
  AppSiteMapConfigs,
  AppTheme,
  AppThemeConfigs
} from 'commons/components/app/AppConfigs';
import { AppContext, type AppNotificationService } from 'commons/components/app/AppContexts';
import { AppDrawerContainer } from 'commons/components/app/AppDrawerContainer';
import type { AppSearchService } from 'commons/components/app/AppSearchService';
import type { AppUser, AppUserService } from 'commons/components/app/AppUserService';
import AppBarProvider from 'commons/components/app/providers/AppBarProvider';
import AppBreadcrumbsProvider from 'commons/components/app/providers/AppBreadcrumbsProvider';
import { AppDrawerProvider } from 'commons/components/app/providers/AppDrawerProvider';
import AppLayoutProvider from 'commons/components/app/providers/AppLayoutProvider';
import AppLeftNavProvider from 'commons/components/app/providers/AppLeftNavProvider';
import AppSnackbarProvider from 'commons/components/app/providers/AppSnackbarProvider';
import { AppStyledEngineProvider } from 'commons/components/app/providers/AppStyledEngineProvider';
import { AppThemesContext, AppThemesProvider } from 'commons/components/app/providers/AppThemesProvider';
import AppUserProvider from 'commons/components/app/providers/AppUserProvider';
import AssistantProvider from 'components/providers/AssistantProvider';
import CarouselProvider from 'components/providers/CarouselProvider';
import { ExternalLookupProvider } from 'components/providers/ExternalLookupProvider';
import HighlightProvider from 'components/providers/HighlightProvider';
import i18n from 'i18n';
import { useCallback, useContext, useMemo, type ReactNode } from 'react';

export type AppProviderProps<U extends AppUser> = {
  overrides?: AppOverrideConfigs;
  preferences?: AppPreferenceConfigs;
  theme?: AppThemeConfigs;
  themes?: AppTheme[];
  sitemap?: AppSiteMapConfigs;
  user?: AppUserService<U>;
  search?: AppSearchService;
  notification?: AppNotificationService;
  children: ReactNode;
};

export const AppProviderInner = <U extends AppUser>({
  user,
  search,
  sitemap,
  notification,
  preferences,
  overrides,
  children
}: Omit<AppProviderProps<U>, 'theme'>) => {
  const {
    current: theme,
    mode: themeMode,
    toggleMode
  } = useContext(overrides?.providers?.themesProvider?.context ?? AppThemesContext);

  // Callback to toggle language.
  const toggleLanguage = useCallback(() => i18n.changeLanguage(i18n.language === 'en' ? 'fr' : 'en'), []);

  // Memoize context value to prevent extraneous renders on components that use it.
  const contextValue = useMemo(() => {
    return {
      theme: themeMode,
      configs: { overrides, preferences, theme, sitemap },
      toggleTheme: toggleMode,
      toggleLanguage
    };
  }, [themeMode, overrides, preferences, theme, sitemap, toggleMode, toggleLanguage]);

  return (
    <AppContext.Provider value={contextValue}>
      <AppStyledEngineProvider>
        <AppUserProvider service={user}>
          <AppSnackbarProvider>
            <BorealisProvider baseURL={location.origin + '/api/v4/proxy/borealis'} getToken={() => null}>
              <AppUserProvider service={user}>
                <AssistantProvider>
                  <HighlightProvider>
                    <ExternalLookupProvider>
                      <CarouselProvider>
                        <AppDrawerProvider>
                          <AppBarProvider search={search} notification={notification}>
                            <AppBreadcrumbsProvider>
                              <AppLeftNavProvider>
                                <AppDrawerContainer>
                                  <AppLayoutProvider>{children}</AppLayoutProvider>
                                </AppDrawerContainer>
                              </AppLeftNavProvider>
                            </AppBreadcrumbsProvider>
                          </AppBarProvider>
                        </AppDrawerProvider>
                      </CarouselProvider>
                    </ExternalLookupProvider>
                  </HighlightProvider>
                </AssistantProvider>
              </AppUserProvider>
            </BorealisProvider>
          </AppSnackbarProvider>
        </AppUserProvider>
      </AppStyledEngineProvider>
    </AppContext.Provider>
  );
};

const AppProvider = <U extends AppUser>({
  theme,
  themes,
  user,
  search,
  sitemap,
  notification,
  preferences,
  overrides,
  children
}: AppProviderProps<U>) => {
  return (
    <AppThemesProvider initTheme={theme} themes={themes} preferences={preferences}>
      <AppProviderInner
        user={user}
        search={search}
        sitemap={sitemap}
        notification={notification}
        preferences={preferences}
        overrides={overrides}
      >
        {children}
      </AppProviderInner>
    </AppThemesProvider>
  );
};

export default AppProvider;
