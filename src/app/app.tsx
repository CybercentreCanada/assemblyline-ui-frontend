import { i18n } from 'app/core.i18n';
import { APP_ROUTES } from 'app/core.routes';
import { AppApiProvider } from 'core/api';
import { AppConfigStoreProvider } from 'core/config';
import { AppErrorProvider } from 'core/error';
import { AppInterfaceStoreProvider } from 'core/interface';
import { AppPreferenceStoreProvider } from 'core/preference';
import {
  AppNavigationProvider,
  AppNavigationStoreProvider,
  AppRouterLayout,
  AppRouterPanelLayout,
  AppRouterProvider,
  AppRouterStoreProvider
} from 'core/router';
import { AppLocationParamProvider, AppLocationParamStoreProvider } from 'core/routes';
import { AppSnackbarProvider } from 'core/snackbar';
import { AppTemplateLayout, AppTemplateProvider } from 'core/template';
import { AppThemeProvider } from 'core/theme';
import { AppAssistantLayout, AppAssistantProvider, AppAssistantStoreProvider } from 'layout/assistant';
import { AppAuthLayout } from 'layout/auth';
import { AppCarouselProvider } from 'layout/carousel';
import { AppDrawerLayout } from 'layout/drawer';
import type { PropsWithChildren } from 'react';
import { memo, StrictMode } from 'react';

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

// export const AppLayout2 = () => (
//   <AppAuthLayout>
//     <AppRouterLayout routes={APP_ROUTES}>
//       <AppDrawerLayout content={<AppRouterPanel panelKey={1} />}>
//         <AppAppsLayout>
//           <AppTemplateLayout>
//             <AppRouterPanel panelKey={0} />
//           </AppTemplateLayout>
//         </AppAppsLayout>
//       </AppDrawerLayout>
//     </AppRouterLayout>
//   </AppAuthLayout>
// );

// export const App2 = () => (
//   <StrictMode>
//     {/* <AppConfigProviderStore> */}
//     <AppThemeProvider>
//       <AppErrorProvider>
//         <AppApiProvider>
//           <AppSnackbarProvider>
//             <AppRouterProvider>
//               <AppLayoutProvider i18n={i18n}>
//                 <AppLayout2 />
//               </AppLayoutProvider>
//             </AppRouterProvider>
//           </AppSnackbarProvider>
//         </AppApiProvider>
//       </AppErrorProvider>
//     </AppThemeProvider>
//     {/* </AppConfigProviderStore> */}
//   </StrictMode>
// );

//*****************************************************************************************
// App Layouts
//*****************************************************************************************

export const AppLayout = memo(() => (
  <AppAuthLayout>
    <AppAssistantLayout>
      <AppRouterLayout>
        <AppDrawerLayout content={<AppRouterPanelLayout panelKey={1} />}>
          <AppTemplateLayout>
            <AppRouterPanelLayout panelKey={0} />
          </AppTemplateLayout>
        </AppDrawerLayout>
      </AppRouterLayout>
    </AppAssistantLayout>
  </AppAuthLayout>
));

AppLayout.displayName = 'AppLayout';

//*****************************************************************************************
// App Providers
//*****************************************************************************************

const AppProviders = memo(({ children }: PropsWithChildren) => (
  <AppThemeProvider>
    <AppTemplateProvider i18n={i18n}>
      <AppErrorProvider>
        <AppSnackbarProvider>
          <AppApiProvider>
            <AppAssistantProvider>
              <AppRouterProvider>
                <AppNavigationProvider>
                  <AppLocationParamProvider appRoutes={APP_ROUTES}>
                    <AppCarouselProvider>
                      <>{children}</>
                    </AppCarouselProvider>
                  </AppLocationParamProvider>
                </AppNavigationProvider>
              </AppRouterProvider>
            </AppAssistantProvider>
          </AppApiProvider>
        </AppSnackbarProvider>
      </AppErrorProvider>
    </AppTemplateProvider>
  </AppThemeProvider>
));

AppProviders.displayName = 'AppProviders';

//*****************************************************************************************
// App Stores
//*****************************************************************************************

const AppStores = memo(({ children }: PropsWithChildren) => (
  <AppConfigStoreProvider>
    <AppInterfaceStoreProvider>
      <AppPreferenceStoreProvider>
        <AppRouterStoreProvider>
          <AppNavigationStoreProvider>
            <AppLocationParamStoreProvider>
              <AppAssistantStoreProvider>
                <>{children}</>
              </AppAssistantStoreProvider>
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
