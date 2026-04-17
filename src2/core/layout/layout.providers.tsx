import {
  AppPreferenceConfigs,
  AppProvider,
  AppRoot,
  AppSearchService,
  AppUserService,
  parseTuiClientCookies,
  useAppLayout,
  useAppUser
} from '@tui/core';
import i18n from 'app/app.i18n';
import { useMyPreferences } from 'app/app.preferences';
import { User } from 'models/base/user';
import React, { PropsWithChildren, useEffect } from 'react';
import { useMyAccessibility } from './hooks/useMyAccessibility';
import { useMyApps } from './hooks/useMyApps';
import useMyNotification from './hooks/useMyNotifications';
import { useMyRouter } from './hooks/useMyRouter';
import useMySearch, { SearchItem } from './hooks/useMySearch';
import useMyUser from './hooks/useMyUser';

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

  useEffect(() => {
    isReady();
    appLayout.setReady(true);

    return () => {
      appLayout.setReady(false);
    };
  }, [appLayout, isReady]);

  return children;
};

export const AppLayoutProvider = React.memo(({ children }: PropsWithChildren) => {
  const cookies = parseTuiClientCookies();

  const myPreferences: AppPreferenceConfigs = useMyPreferences();
  const myUser: AppUserService<User> = useMyUser();
  const mySearch: AppSearchService<SearchItem> = useMySearch();
  const myAccessibility = useMyAccessibility();
  const myNotification = useMyNotification();
  const myApps = useMyApps();
  const myRouter = useMyRouter();

  return (
    <AppRoot
      // cookies={cookies}
      cookies={{
        theme: 'default',
        mode: 'dark',
        lang: 'en',
        layout: 'top',
        density: 'dense',
        drawerOpen: true,
        autoHideAppbar: false,
        showQuickSearch: false,
        showBreadcrumbs: false
      }}
      i18n={i18n}
    >
      {/* <AppDrawerProvider>
        <AppAccessibilityProvider {...myAccessibility}>
          <AppNotificationServiceProvider service={myNotification}>
            <AppSwitcherProvider apps={myApps}>
              <AppClassificationProvider
                url="/api/v1/classification" //                  👈 classfification provider from server endpoint.
                //value={value.public_settings.classification}   👈 classification provided by root loader.
                // value="u"                                     👈 classification explicitly provided.
              > */}
      <AppProvider
        router={myRouter}
        preferences={myPreferences}
        user={{
          isReady: () => true,
          user: { id: 'test', name: 'test' },
          setUser: () => {},
          validateProps: () => true
        }}

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
      {/* </AppClassificationProvider>
            </AppSwitcherProvider>
          </AppNotificationServiceProvider>
        </AppAccessibilityProvider>
      </AppDrawerProvider> */}
    </AppRoot>
  );
});
