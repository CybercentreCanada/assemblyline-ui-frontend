import { useAppSwitcher } from '@tui/apps';
import { AppProvider, useAppLayout, useAppUser } from '@tui/core';
import React, { PropsWithChildren, useEffect } from 'react';
import { useAppTemplatePreferences } from './hooks/useAppTemplatePreferences';
import { useAppTemplateRouter } from './hooks/useAppTemplateRouter';
import { useAppTemplateUser } from './hooks/useAppTemplateUser';

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

export const AppTemplateLayout = React.memo(({ children }: PropsWithChildren) => {
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
