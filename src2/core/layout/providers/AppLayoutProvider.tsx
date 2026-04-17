import { AppSwitcherProvider, useAppSwitcher } from '@tui/apps';
import {
  AppPreferenceConfigs,
  AppProvider,
  AppSearchService,
  AppUserService,
  useAppLayout,
  useAppUser
} from '@tui/core';
import { useMyPreferences } from 'app/app.preferences';
import { useAppConfig } from 'core/config';
import { User } from 'models/base/user';
import React, { PropsWithChildren, useEffect } from 'react';
import { useMyAccessibility } from '../hooks/useMyAccessibility';
import useMyNotification from '../hooks/useMyNotifications';
import { useMyRouter } from '../hooks/useMyRouter';
import useMySearch, { SearchItem } from '../hooks/useMySearch';
import useMyUser from '../hooks/useMyUser';

export const AppInnerLayout = ({ children }: PropsWithChildren) => {
  const appLayout = useAppLayout();
  const appUser = useAppUser();
  const appSwitcher = useAppSwitcher();

  const myApps = useAppConfig(s => s?.configuration?.ui?.apps || null);

  // Is App ready ?
  useEffect(() => {
    appUser.isReady();
    appLayout.setReady(true);
    return () => appLayout.setReady(false);
  }, [appLayout, appUser]);

  // Setting the apps in the AppSwitcher
  useEffect(() => {
    appSwitcher.setItems(myApps);
  }, [myApps]);

  return <>{children}</>;
};

export const AppLayoutProvider = React.memo(({ children }: PropsWithChildren) => {
  const myPreferences: AppPreferenceConfigs = useMyPreferences();
  const myUser: AppUserService<User> = useMyUser();
  const mySearch: AppSearchService<SearchItem> = useMySearch();
  const myAccessibility = useMyAccessibility();
  const myNotification = useMyNotification();
  const myRouter = useMyRouter();

  return (
    <AppSwitcherProvider>
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
        <AppInnerLayout>{children}</AppInnerLayout>
      </AppProvider>
    </AppSwitcherProvider>
  );
});
