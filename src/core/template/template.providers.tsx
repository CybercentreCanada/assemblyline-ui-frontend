import { useMediaQuery } from '@mui/material';
import { useAppSwitcher } from '@tui/apps';
import type { AppPreferenceConfigs, AppRouterAdapter, AppUserService } from '@tui/core';
import { AppProvider, AppRoot, useAppLayout, useAppUser } from '@tui/core';
import { useAppPreferenceStore } from 'core/preference';
import type { i18n } from 'i18next';
import type { PropsWithChildren } from 'react';
import { memo, useEffect, useMemo } from 'react';

//*****************************************************************************************
// App Auth Store
//*****************************************************************************************

const Inner = ({ children }: PropsWithChildren) => {
  const appLayout = useAppLayout();
  const { isReady } = useAppUser();
  const { setItems, items } = useAppSwitcher();

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
  const autoHideAppbar = useAppPreferenceStore(s => s.layout.autoHideAppbar);
  const density = useAppPreferenceStore(s => s.layout.density);
  const drawerOpen = useAppPreferenceStore(s => s.layout.drawerOpen);
  const lang = useAppPreferenceStore(s => s.layout.lang);
  const layout = useAppPreferenceStore(s => s.layout.layout);
  const themeID = useAppPreferenceStore(s => s.layout.theme);

  // const mode = useAppTemplateThemeMode();
  // const skin = useAppInterfaceStore(s => s.theme.skin);
  // const themes = useMemo(() => (skin ? [skin] : []), [skin]);

  const requestedMode = useAppPreferenceStore(s => s.layout.mode);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const mode = useMemo(
    () => (requestedMode === 'system' ? (prefersDarkMode ? 'dark' : 'light') : requestedMode),
    [requestedMode, prefersDarkMode]
  );

  return (
    <AppRoot
      cookies={{
        autoHideAppbar,
        density,
        drawerOpen,
        lang,
        layout,
        mode,
        showBreadcrumbs: false,
        showQuickSearch: false,
        theme: themeID
      }}
      i18n={i18n}
      // themes={themes}
    >
      {children}
    </AppRoot>
  );
});

AppTemplateProvider.displayName = 'AppTemplateProvider';
