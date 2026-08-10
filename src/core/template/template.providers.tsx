import { useAppSwitcher } from '@tui/apps';
import type { AppPreferenceConfigs } from '@tui/core';
import { AppProvider, AppRoot, useAppLayout, useAppUser } from '@tui/core';
import { useAppPreferenceStore } from 'core/preference';
import { useAppPreferences } from 'core/template/hooks/useAppPreferences';
import { useAppTemplateRouter } from 'core/template/hooks/useAppTemplateRouter';
import { useAppTemplateUser } from 'core/template/hooks/useAppTemplateUser';
import { useAppTemplateThemeMode } from 'core/template/template.hooks';
import type { i18n } from 'i18next';
import type { AppLeftNavItem } from 'layout/left-nav';
import type { PropsWithChildren } from 'react';
import { memo, useEffect } from 'react';

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
  preferences: AppPreferenceConfigs;
  leftNav: AppLeftNavItem[];
}>;

export const AppTemplateLayout = memo(({ children, preferences, leftNav }: AppTemplateLayoutProps) => {
  // const cookies = parseTuiClientCookies();

  // const myPreferences: AppPreferenceConfigs = useMyPreferences();
  // const myUser: AppUserService<User> = useMyUser();
  // const myAccessibility = useMyAccessibility();
  // const myNotification = useMyNotification();
  // const myApps = useMyApps();
  const appPreferences = useAppPreferences({ preferences, leftNav });
  const appTemplateRouter = useAppTemplateRouter();
  const appTemplateUser = useAppTemplateUser();

  return (
    <AppProvider
      preferences={appPreferences}
      router={appTemplateRouter}
      user={appTemplateUser}
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
  const showBreadcrumbs = useAppPreferenceStore(s => s.layout.showBreadcrumbs);
  const showQuickSearch = useAppPreferenceStore(s => s.layout.showQuickSearch);
  const themeID = useAppPreferenceStore(s => s.layout.theme);

  const mode = useAppTemplateThemeMode();
  // const skin = useAppInterfaceStore(s => s.theme.skin);
  // const themes = useMemo(() => (skin ? [skin] : []), [skin]);

  return (
    <AppRoot
      cookies={{
        autoHideAppbar,
        density,
        drawerOpen,
        lang,
        layout,
        mode,
        showBreadcrumbs,
        showQuickSearch,
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
