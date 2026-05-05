import { useAppSwitcher } from '@tui/apps';
import { AppProvider, AppRoot, useAppLayout, useAppUser } from '@tui/core';
import { useAppPreferenceStore } from 'core/preference';
import { useAppThemeStore } from 'core/theme';
import type { i18n } from 'i18next';
import type { PropsWithChildren } from 'react';
import { memo, useEffect, useMemo } from 'react';
import { useAppTemplatePreferences } from './hooks/useAppTemplatePreferences';
import { useAppTemplateRouter } from './hooks/useAppTemplateRouter';
import { useAppTemplateUser } from './hooks/useAppTemplateUser';
import { useAppLayoutThemeMode } from './layout.hooks';

// const cookies: {
//   theme: string;
//   mode: 'light' | 'dark';
//   lang: string;
//   layout: 'top' | 'side';
//   density: 'dense' | 'comfortable' | 'compact';
//   drawerOpen: boolean;
//   autoHideAppbar: boolean;
//   showQuickSearch: boolean;
//   showBreadcrumbs: boolean;
// };

export const Inner = ({ children }: PropsWithChildren) => {
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

export const AppTemplateLayout = memo(({ children }: PropsWithChildren) => {
  // const cookies = parseTuiClientCookies();

  // const myPreferences: AppPreferenceConfigs = useMyPreferences();
  // const myUser: AppUserService<User> = useMyUser();
  // const mySearch: AppSearchService<SearchItem> = useMySearch();
  // const myAccessibility = useMyAccessibility();
  // const myNotification = useMyNotification();
  // const myApps = useMyApps();
  const appTemplatePreferences = useAppTemplatePreferences();
  const appTemplateRouter = useAppTemplateRouter();
  const appTemplateUser = useAppTemplateUser();

  return (
    <AppProvider
      preferences={appTemplatePreferences}
      router={appTemplateRouter}
      user={appTemplateUser}

      // preferences={null}
      // sitemap={{}}
      // theme={{}}
      // user={null}

      // preferences={myPreferences}
      // theme={myTheme}
      // sitemap={mySitemap}
      // search={mySearch}
      // user={myUser}
    >
      <Inner>{children}</Inner>
    </AppProvider>
  );
});

AppTemplateLayout.displayName = 'AppTemplateLayout';

export type AppLayoutProviderProps = PropsWithChildren & {
  i18n: i18n;
};

export const AppLayoutProvider = memo(({ children, i18n }: AppLayoutProviderProps) => {
  const autoHideAppbar = useAppPreferenceStore(s => s.layout.autoHideAppbar);
  const density = useAppPreferenceStore(s => s.layout.density);
  const drawerOpen = useAppPreferenceStore(s => s.layout.drawerOpen);
  const lang = useAppPreferenceStore(s => s.layout.lang);
  const layout = useAppPreferenceStore(s => s.layout.layout);
  const showBreadcrumbs = useAppPreferenceStore(s => s.layout.showBreadcrumbs);
  const showQuickSearch = useAppPreferenceStore(s => s.layout.showQuickSearch);
  const themeID = useAppPreferenceStore(s => s.layout.theme);

  const mode = useAppLayoutThemeMode();
  const skin = useAppThemeStore(s => s.skin);
  const themes = useMemo(() => (skin ? [skin] : []), [skin]);

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
      themes={themes}
    >
      {children}
    </AppRoot>
  );
});

AppLayoutProvider.displayName = 'AppLayoutProvider';
