import { useMemo, type FC, type PropsWithChildren, type ReactNode } from 'react';
import type { AppRouterAdapter } from '../router';
import type { AppSearchService } from '../search/AppSearchService';
import type { AppUser, AppUserService } from '../user';
import type { AppPreferenceConfigs } from './AppConfigs';
import { AppContext, type AppContextType } from './AppContexts';
import AppBarProvider from './providers/AppBarProvider';
import AppBreadcrumbsProvider from './providers/AppBreadcrumbsProvider';
import AppLayoutProvider from './providers/AppLayoutProvider';
import AppLeftNavProvider from './providers/AppLeftNavProvider';
import AppSnackbarProvider from './providers/AppSnackbarProvider';
import AppUserProvider from './providers/AppUserProvider';

const AppLayoutSlot: FC<PropsWithChildren & { preferences: AppPreferenceConfigs }> = ({ preferences, children }) => {
  if (preferences?.slots?.layout) {
    return <preferences.slots.layout>{children}</preferences.slots.layout>;
  }

  return children;
};

export type AppProviderProps<U extends AppUser> = {
  router: AppRouterAdapter;
  preferences?: AppPreferenceConfigs;
  user?: AppUserService<U>;
  search?: AppSearchService;
  children: ReactNode;
};

export const AppProvider = <U extends AppUser>({
  router,
  user,
  search,
  preferences,
  children
}: Omit<AppProviderProps<U>, 'theme'>) => {
  // Memoize context value to prevent extraneous renders on components that use it.
  const contextValue: AppContextType = useMemo(() => {
    return {
      initialized: true,
      router,
      preferences
    };
  }, [router, preferences]);

  return (
    <AppContext.Provider value={contextValue}>
      <AppUserProvider service={user}>
        <AppSnackbarProvider>
          <AppBarProvider search={search}>
            <AppBreadcrumbsProvider>
              <AppLeftNavProvider>
                <AppLayoutSlot preferences={preferences}>
                  <AppLayoutProvider>{children}</AppLayoutProvider>
                </AppLayoutSlot>
              </AppLeftNavProvider>
            </AppBreadcrumbsProvider>
          </AppBarProvider>
        </AppSnackbarProvider>
      </AppUserProvider>
    </AppContext.Provider>
  );
};
