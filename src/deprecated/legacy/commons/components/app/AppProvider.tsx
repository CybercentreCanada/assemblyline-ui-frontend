import { ClueDatabaseContext, ClueProvider } from '@cccsaurora/clue-ui';
import i18n from 'app/core.i18n';
import { AppErrorProvider } from 'core/error/error.components';
import HighlightProvider from 'deprecated/hooks/useHighlighter';
import type {
  AppOverrideConfigs,
  AppPreferenceConfigs,
  AppSiteMapConfigs,
  AppTheme,
  AppThemeConfigs
} from 'deprecated/legacy/commons/components/app/AppConfigs';
import { AppContext } from 'deprecated/legacy/commons/components/app/AppContexts';
import { AppDrawerContainer } from 'deprecated/legacy/commons/components/app/AppDrawerContainer';
import type { AppSearchService } from 'deprecated/legacy/commons/components/app/AppSearchService';
import type { AppUser, AppUserService } from 'deprecated/legacy/commons/components/app/AppUserService';
import AppBarProvider from 'deprecated/legacy/commons/components/app/providers/AppBarProvider';
import AppBreadcrumbsProvider from 'deprecated/legacy/commons/components/app/providers/AppBreadcrumbsProvider';
import { AppDrawerProvider } from 'deprecated/legacy/commons/components/app/providers/AppDrawerProvider';
import AppLayoutProvider from 'deprecated/legacy/commons/components/app/providers/AppLayoutProvider';
import AppLeftNavProvider from 'deprecated/legacy/commons/components/app/providers/AppLeftNavProvider';
import AppSnackbarProvider from 'deprecated/legacy/commons/components/app/providers/AppSnackbarProvider';
import { AppStyledEngineProvider } from 'deprecated/legacy/commons/components/app/providers/AppStyledEngineProvider';
import {
  AppThemesContext,
  AppThemesProvider
} from 'deprecated/legacy/commons/components/app/providers/AppThemesProvider';
import AppUserProvider from 'deprecated/legacy/commons/components/app/providers/AppUserProvider';
import CarouselProvider from 'deprecated/legacy/components/providers/CarouselProvider';
import DrawerProvider from 'deprecated/legacy/components/providers/DrawerProvider';
import AssistantProvider from 'layout/assistant/assistant.providers';
import { ExternalLookupProvider } from 'layout/external-lookup/external-lookup.hooks';
import { WhoAmIProps } from 'models/api/user';
import { useCallback, useContext, useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import JSONEditor from 'ui/JSONEditor';

export type AppProviderProps<U extends AppUser> = {
  overrides?: AppOverrideConfigs;
  preferences?: AppPreferenceConfigs;
  theme?: AppThemeConfigs;
  themes?: AppTheme[];
  sitemap?: AppSiteMapConfigs;
  user?: AppUserService<U>;
  search?: AppSearchService;
  children: ReactNode;
};

export type CluePublicConfig = {
  chunk_size?: number;
  debug_logging?: boolean;
  default_timeout?: number;
  iconify_url?: string;
  max_request_count?: number;
};

export const AppProviderInner = <U extends AppUser>({
  user,
  search,
  sitemap,
  preferences,
  overrides,
  children
}: Omit<AppProviderProps<U>, 'theme'>) => {
  const i18next = useTranslation('clue');
  const database = useContext(ClueDatabaseContext);

  const clueConfig = useMemo<CluePublicConfig>(
    () => (user as unknown as WhoAmIProps)?.configuration?.ui?.api_proxies?.clue as CluePublicConfig,
    [user]
  );

  const {
    autoDetectColorScheme,
    current: theme,
    mode: themeMode,
    setAutoDetectColorScheme,
    setMode,
    toggleAutoDetectColorScheme,
    toggleMode
  } = useContext(overrides?.providers?.themesProvider?.context ?? AppThemesContext);

  // Callback to toggle language.
  const toggleLanguage = useCallback(() => i18n.changeLanguage(i18n.language === 'en' ? 'fr' : 'en'), []);

  // Memoize context value to prevent extraneous renders on components that use it.
  const contextValue = useMemo(() => {
    return {
      autoDetectColorScheme,
      configs: { overrides, preferences, theme, sitemap },
      theme: themeMode,
      setAutoDetectColorScheme,
      setMode,
      toggleAutoDetectColorScheme,
      toggleLanguage,
      toggleTheme: toggleMode
    };
  }, [
    autoDetectColorScheme,
    overrides,
    preferences,
    setAutoDetectColorScheme,
    setMode,
    sitemap,
    theme,
    themeMode,
    toggleAutoDetectColorScheme,
    toggleLanguage,
    toggleMode
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      <AppStyledEngineProvider>
        <AppErrorProvider>
          <AppUserProvider service={user}>
            <AppSnackbarProvider>
              <ClueProvider
                baseURL={location.origin + '/api/v4/proxy/clue'}
                chunkSize={clueConfig?.chunk_size || 200}
                database={database}
                debugLogging={clueConfig?.debug_logging || false}
                defaultTimeout={clueConfig?.default_timeout || 60}
                i18next={i18next}
                maxRequestCount={clueConfig?.max_request_count || 3}
                ReactJson={JSONEditor}
                {...(clueConfig?.iconify_url
                  ? {
                      customIconify: clueConfig?.iconify_url,
                      publicIconify: false
                    }
                  : {
                      publicIconify: true
                    })}
              >
                <AppUserProvider service={user}>
                  <AssistantProvider>
                    <HighlightProvider>
                      <ExternalLookupProvider>
                        <CarouselProvider>
                          <AppDrawerProvider>
                            <DrawerProvider>
                              <AppBarProvider search={search}>
                                <AppBreadcrumbsProvider>
                                  <AppLeftNavProvider>
                                    <AppDrawerContainer>
                                      <AppLayoutProvider>{children}</AppLayoutProvider>
                                    </AppDrawerContainer>
                                  </AppLeftNavProvider>
                                </AppBreadcrumbsProvider>
                              </AppBarProvider>
                            </DrawerProvider>
                          </AppDrawerProvider>
                        </CarouselProvider>
                      </ExternalLookupProvider>
                    </HighlightProvider>
                  </AssistantProvider>
                </AppUserProvider>
              </ClueProvider>
            </AppSnackbarProvider>
          </AppUserProvider>
        </AppErrorProvider>
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
  preferences,
  overrides,
  children
}: AppProviderProps<U>) => {
  return (
    <AppThemesProvider initTheme={theme} themes={themes} preferences={preferences}>
      <AppProviderInner user={user} search={search} sitemap={sitemap} preferences={preferences} overrides={overrides}>
        {children}
      </AppProviderInner>
    </AppThemesProvider>
  );
};

export default AppProvider;
