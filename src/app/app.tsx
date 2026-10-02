import { AppSwitcherProvider } from '@tui/apps';
import { DEFAULT_APP_CONFIG_STORE } from 'app/core.config';
import { i18n } from 'app/core.i18n';
import { DEFAULT_APP_INTERFACE_STORE } from 'app/core.interface';
import { APP_PREFERENCE_SCHEMA, APP_PREFERENCE_STORAGE_KEY } from 'app/core.preference';
import { useAppRoutes } from 'app/core.routes';
import { useAppTemplatePreferences, useAppTemplateRouter, useAppTemplateUser } from 'app/core.template';
import { AppApiProvider } from 'core/api';
import { AppConfigStoreProvider, useAppConfigStore } from 'core/config';
import { AppErrorProvider } from 'core/error';
import { AppInterfaceStoreProvider } from 'core/interface';
import { AppPreferenceProvider, AppPreferenceStoreProvider } from 'core/preference';
import {
  AppLocationParamProvider,
  AppLocationParamStoreProvider,
  AppNavigationProvider,
  AppNavigationStoreProvider,
  AppRouterLayout,
  AppRouterPanelLayout,
  AppRouterProvider,
  AppRouterStoreProvider
} from 'core/router';
import { AppSnackbarProvider } from 'core/snackbar';
import { AppTemplateLayout, AppTemplateProvider } from 'core/template';
import { AppAssistantLayout, AppAssistantProvider } from 'layout/assistant';
import { AppAuthLayout } from 'layout/auth';
import { AppCarouselLayout } from 'layout/carousel';
import { AppClueProvider } from 'layout/clue';
import { AppDebugLayout } from 'layout/debug';
import { AppDrawerLayout } from 'layout/drawer';
import { AppSystemVersionLayout } from 'layout/system-version';
import type { PropsWithChildren } from 'react';
import { memo, StrictMode } from 'react';

//*****************************************************************************************
// App Layouts
//*****************************************************************************************

export const AppLayout = memo(() => {
  const preferences = useAppTemplatePreferences();
  const router = useAppTemplateRouter();
  const user = useAppTemplateUser();

  return (
    <AppAuthLayout>
      <AppCarouselLayout>
        <AppAssistantLayout>
          <AppDebugLayout>
            <AppRouterLayout>
              <AppDrawerLayout content={<AppRouterPanelLayout panelKey={1} />}>
                <AppTemplateLayout preferences={preferences} router={router} user={user}>
                  <AppSystemVersionLayout>
                    <AppRouterPanelLayout panelKey={0} />
                  </AppSystemVersionLayout>
                </AppTemplateLayout>
              </AppDrawerLayout>
            </AppRouterLayout>
          </AppDebugLayout>
        </AppAssistantLayout>
      </AppCarouselLayout>
    </AppAuthLayout>
  );
});

AppLayout.displayName = 'AppLayout';

//*****************************************************************************************
// App Providers
//*****************************************************************************************

const AppProviders = memo(({ children }: PropsWithChildren) => {
  const apps = useAppConfigStore(s => s?.configuration?.ui?.apps || []);
  const routes = useAppRoutes();

  return (
    <AppPreferenceProvider schema={APP_PREFERENCE_SCHEMA} storageKey={APP_PREFERENCE_STORAGE_KEY}>
      <AppSwitcherProvider apps={apps}>
        <AppTemplateProvider i18n={i18n}>
          <AppErrorProvider>
            <AppSnackbarProvider>
              <AppApiProvider>
                <AppAssistantProvider>
                  <AppRouterProvider>
                    <AppNavigationProvider>
                      <AppLocationParamProvider routes={routes}>
                        <AppClueProvider>{children}</AppClueProvider>
                      </AppLocationParamProvider>
                    </AppNavigationProvider>
                  </AppRouterProvider>
                </AppAssistantProvider>
              </AppApiProvider>
            </AppSnackbarProvider>
          </AppErrorProvider>
        </AppTemplateProvider>
      </AppSwitcherProvider>
    </AppPreferenceProvider>
  );
});

AppProviders.displayName = 'AppProviders';

//*****************************************************************************************
// App Stores
//*****************************************************************************************

const AppStores = memo(({ children }: PropsWithChildren) => (
  <AppConfigStoreProvider data={DEFAULT_APP_CONFIG_STORE}>
    <AppInterfaceStoreProvider data={DEFAULT_APP_INTERFACE_STORE}>
      <AppPreferenceStoreProvider>
        <AppRouterStoreProvider>
          <AppNavigationStoreProvider>
            <AppLocationParamStoreProvider>
              <>{children}</>
            </AppLocationParamStoreProvider>
          </AppNavigationStoreProvider>
        </AppRouterStoreProvider>
      </AppPreferenceStoreProvider>
    </AppInterfaceStoreProvider>
  </AppConfigStoreProvider>
));

AppStores.displayName = 'AppStores';

//*****************************************************************************************
// App
//*****************************************************************************************

export const App = memo(() => (
  <StrictMode>
    <AppStores>
      <AppProviders>
        <AppLayout />
      </AppProviders>
    </AppStores>
  </StrictMode>
));

App.displayName = 'App';
