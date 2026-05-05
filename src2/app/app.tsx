import { AppApiProvider } from 'core/api';
import { AppConfigStoreProvider } from 'core/config/config.providers';
import { AppErrorProvider } from 'core/error';
import { AppInterfaceStoreProvider } from 'core/interface';
import { AppLayoutStoreProvider } from 'core/layout';
import { AppPreferenceStoreProvider } from 'core/preference';
import { AppRouterLayout, AppRouterPanel, AppRouterProvider, AppRouterRootProvider } from 'core/router';
import { AppSnackbarProvider } from 'core/snackbar';
import { AppThemeProvider } from 'core/theme';
import { AppAppsLayout } from 'layout/apps/apps.layout';
import { AppAuthLayout } from 'layout/auth';
import { AppDrawerLayout } from 'layout/drawer/drawer.layout';
import { AppDrawerStoreProvider } from 'layout/drawer/drawer.providers';
import { AppTemplateLayout, AppTemplateProvider } from 'layout/template';
import type { PropsWithChildren } from 'react';
import { memo, StrictMode } from 'react';
import i18n from './app.i18n';
import { APP_ROUTES } from './app.routes';

/**
 * MyAPP:
 * BrowserRouter
 * APIProvider
 * SafeResultsProvider
 * QuotaProvider
 *
 * TemplateUI
 * AppThemesProvider
 * MUI's Style engine
 * ErrorBoundary
 * UserProvider
 * SnackbarProvider
 * BorealisProvider
 * UserProvider
 * AssistantProvider
 * HighlightProvider
 * ExternalLookupProvider
 * CarouselProvider
 * AppDrawerProvider
 *
 * Layout:
 * AppBarProvider
 * AppBreadcrumbsProvider
 * AppLeftNavProvider
 * AppDrawerContainer
 * AppLayoutProvider
 */

// export const Layout = () => <AppAuthLayout></AppAuthLayout>;

// export const App2 = () => (
//   <StrictMode>
//     <AppConfigProvider>
//       <AppThemeProvider>
//         <AppErrorLayout>
//           <AppApiProvider>
//             app
//             {/* <AppLayoutRoot>
//               <AppSnackbarProvider>
//                 <AppRouterProvider>
//                   <AppAuthProvider>
//                     <AppLayoutProvider>
//                       <AppRouter />
//                     </AppLayoutProvider>
//                   </AppAuthProvider>
//                 </AppRouterProvider>
//               </AppSnackbarProvider>
//             </AppLayoutRoot> */}
//           </AppApiProvider>
//         </AppErrorLayout>
//       </AppThemeProvider>
//     </AppConfigProvider>
//   </StrictMode>
// );

export const AppLayout2 = () => (
  <AppAuthLayout>
    <AppRouterLayout routes={APP_ROUTES}>
      <AppDrawerLayout content={<AppRouterPanel panelKey={1} />}>
        <AppAppsLayout>
          <AppTemplateLayout>
            <AppRouterPanel panelKey={0} />
          </AppTemplateLayout>
        </AppAppsLayout>
      </AppDrawerLayout>
    </AppRouterLayout>
  </AppAuthLayout>
);

export const App2 = () => (
  <StrictMode>
    {/* <AppConfigProviderStore> */}
    <AppThemeProvider>
      <AppErrorProvider>
        <AppApiProvider>
          <AppSnackbarProvider>
            <AppRouterProvider>
              <AppLayoutProvider i18n={i18n}>
                <AppLayout2 />
              </AppLayoutProvider>
            </AppRouterProvider>
          </AppSnackbarProvider>
        </AppApiProvider>
      </AppErrorProvider>
    </AppThemeProvider>
    {/* </AppConfigProviderStore> */}
  </StrictMode>
);

//*****************************************************************************************
// App Layouts
//*****************************************************************************************

export const AppLayout = memo(() => (
  <AppAuthLayout>
    <AppRouterLayout routes={APP_ROUTES}>
      <AppDrawerLayout content={<AppRouterPanel panelKey={1} />}>
        <AppTemplateLayout>
          <AppRouterPanel panelKey={0} />
        </AppTemplateLayout>
      </AppDrawerLayout>
    </AppRouterLayout>
  </AppAuthLayout>
));

AppLayout.displayName = 'AppLayout';

//*****************************************************************************************
// App Providers
//*****************************************************************************************

const AppProviders = memo(({ children }: PropsWithChildren) => (
  <AppThemeProvider>
    <AppErrorProvider>
      <AppSnackbarProvider>
        <AppApiProvider>
          <AppRouterProvider>
            <AppTemplateProvider i18n={i18n}>
              <>{children}</>
            </AppTemplateProvider>
          </AppRouterProvider>
        </AppApiProvider>
      </AppSnackbarProvider>
    </AppErrorProvider>
  </AppThemeProvider>
));

AppProviders.displayName = 'AppProviders';

//*****************************************************************************************
// App Stores
//*****************************************************************************************

const AppStores = memo(({ children }: PropsWithChildren) => (
  <AppConfigStoreProvider>
    <AppDrawerStoreProvider>
      <AppInterfaceStoreProvider>
        <AppLayoutStoreProvider>
          <AppPreferenceStoreProvider>
            <AppRouterRootProvider>
              <>{children}</>
            </AppRouterRootProvider>
          </AppPreferenceStoreProvider>
        </AppLayoutStoreProvider>
      </AppInterfaceStoreProvider>
    </AppDrawerStoreProvider>
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
