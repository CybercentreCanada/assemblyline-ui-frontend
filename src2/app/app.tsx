import { AppApiProvider, AppApiStoreProvider } from 'core/api';
import { AppConfigStoreProvider } from 'core/config/config.providers';
import { AppErrorProvider } from 'core/error';
import { AppLayoutProvider } from 'core/layout';
import { AppPreferenceStoreProvider } from 'core/preference';
import { AppRouterProvider, AppRouterRootProvider } from 'core/router';
import { AppSnackbarProvider } from 'core/snackbar';
import { AppThemeProvider, AppThemeStoreProvider } from 'core/theme';
import { AppAppsLayout } from 'layout/apps/apps.layout';
import { AppAuthLayout, AppAuthStoreProvider } from 'layout/auth';
import { AppDrawerLayout } from 'layout/drawer/drawer.layout';
import { AppRouterLayout, AppRouterPanel } from 'layout/router';
import { AppTemplateLayout } from 'layout/template';
import { memo, PropsWithChildren, StrictMode } from 'react';
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
    <>{'Test'}</>
  </AppAuthLayout>
));

//*****************************************************************************************
// App Providers
//*****************************************************************************************

const AppProviders = memo(({ children }: PropsWithChildren) => (
  <AppThemeProvider>
    <AppErrorProvider>
      <AppSnackbarProvider>
        <AppApiProvider>
          <AppRouterProvider>
            <>{children}</>
          </AppRouterProvider>
        </AppApiProvider>
      </AppSnackbarProvider>
    </AppErrorProvider>
  </AppThemeProvider>
));

//*****************************************************************************************
// App Stores
//*****************************************************************************************

const AppStores = memo(({ children }: PropsWithChildren) => (
  <AppApiStoreProvider>
    <AppAuthStoreProvider>
      <AppConfigStoreProvider>
        <AppPreferenceStoreProvider>
          <AppRouterRootProvider>
            <AppThemeStoreProvider>
              <>{children}</>
            </AppThemeStoreProvider>
          </AppRouterRootProvider>
        </AppPreferenceStoreProvider>
      </AppConfigStoreProvider>
    </AppAuthStoreProvider>
  </AppApiStoreProvider>
));

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
