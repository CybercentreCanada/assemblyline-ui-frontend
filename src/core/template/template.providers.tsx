import type { AppPreferenceConfigs, AppRouterAdapter, AppUserService } from '@tui/core';
import { AppProvider, AppRoot, useAppLayout, useAppUser } from '@tui/core';
import { useAppInterfaceStore } from 'core/interface';
import { useAppPreferenceStore } from 'core/preference';
import {
  useAppTemplateBarHeight,
  useAppTemplateThemeInitializer,
  useAppTemplateThemeMode,
  useOverrideTemplatePreferences
} from 'core/template';
import type { i18n } from 'i18next';
import type { PropsWithChildren } from 'react';
import { memo, useEffect, useMemo } from 'react';

//*****************************************************************************************
// App Auth Store
//*****************************************************************************************

const Inner = ({ children }: PropsWithChildren) => {
  const appLayout = useAppLayout();
  const { isReady } = useAppUser();

  useOverrideTemplatePreferences();

  useEffect(() => {
    isReady();
    appLayout.setReady(true);

    return () => {
      appLayout.setReady(false);
    };
  }, [appLayout, isReady]);

  return children;
};

//*****************************************************************************************
// App Auth Store
//*****************************************************************************************

export type AppTemplateLayoutProps = PropsWithChildren<{
  preferences?: AppPreferenceConfigs;
  router: AppRouterAdapter;
  // search?: AppSearchService;
  user?: AppUserService<unknown>;
}>;

export const AppTemplateLayout = memo(({ children, preferences, router, user }: AppTemplateLayoutProps) => {
  // const cookies = parseTuiClientCookies();

  // const myPreferences: AppPreferenceConfigs = useMyPreferences();
  // const myUser: AppUserService<User> = useMyUser();
  // const myAccessibility = useMyAccessibility();
  // const myNotification = useMyNotification();
  // const myApps = useMyApps();

  return (
    <AppProvider
      preferences={preferences}
      router={router}
      user={user}
      // preferences={null}
      // sitemap={{}}
      // theme={{}}
      // user={null}

      // preferences={myPreferences}
      // theme={myTheme}
      // sitemap={mySitemap}
      // user={myUser}
    >
      <Inner>{children}</Inner>
    </AppProvider>
  );
});

AppTemplateLayout.displayName = 'AppTemplateLayout';

//*****************************************************************************************
// App Template Store Provider
//*****************************************************************************************

export type AppTemplateProviderProps = PropsWithChildren<{
  i18n: i18n;
}>;

export const AppTemplateProvider = memo(({ children, i18n }: AppTemplateProviderProps) => {
  const autoHideAppbar = useAppPreferenceStore(s => s.template.autoHideAppbar);
  const density = useAppPreferenceStore(s => s.template.density);
  const drawerOpen = useAppPreferenceStore(s => s.template.drawerOpen);
  const lang = useAppPreferenceStore(s => s.template.lang);
  const layout = useAppPreferenceStore(s => s.template.layout);
  const leftNavHover = useAppPreferenceStore(s => s.template.leftNavHover);
  const themeID = useAppPreferenceStore(s => s.template.theme);
  const initialized = useAppInterfaceStore(s => s.theme.initialized);
  const skin = useAppInterfaceStore(s => s.theme.skin);

  useAppTemplateThemeInitializer();
  // useAppTemplateThemePatcher();
  useAppTemplateBarHeight();

  const mode = useAppTemplateThemeMode();
  const themes = useMemo(() => (skin ? [skin] : undefined), [skin]);

  return !initialized ? null : (
    <AppRoot
      cookies={{
        autoHideAppbar,
        density,
        drawerOpen,
        lang,
        layout,
        leftNavHover,
        mode,
        showBreadcrumbs: false,
        showQuickSearch: false,
        theme: skin?.id ?? themeID
      }}
      i18n={i18n}
      themes={themes}
    >
      {children}
    </AppRoot>
  );
});

AppTemplateProvider.displayName = 'AppTemplateProvider';
