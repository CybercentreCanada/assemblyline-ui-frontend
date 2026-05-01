import { AppAPIProvider } from 'core/api';
import { AppConfigProvider } from 'core/config';
import { AppErrorProviders } from 'core/error';
import { AppLayoutProvider } from 'core/layout';
import { AppRouterProvider } from 'core/router';
import { AppSnackbarProvider } from 'core/snackbar';
import { AppThemeProvider } from 'core/theme';
import { AppAppsLayout } from 'layout/apps/apps.layout';
import { AppAuthLayout } from 'layout/auth';
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
//           <AppAPIProvider>
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
//           </AppAPIProvider>
//         </AppErrorLayout>
//       </AppThemeProvider>
//     </AppConfigProvider>
//   </StrictMode>
// );

export const App2 = () => (
  <StrictMode>
    <AppConfigProvider>
      <AppThemeProvider>
        <AppErrorProviders>
          <AppAPIProvider>
            <AppSnackbarProvider>
              <AppRouterProvider>
                <AppLayoutProvider i18n={i18n}>
                  <AppLayout />
                </AppLayoutProvider>
              </AppRouterProvider>
            </AppSnackbarProvider>
          </AppAPIProvider>
        </AppErrorProviders>
      </AppThemeProvider>
    </AppConfigProvider>
  </StrictMode>
);

//*****************************************************************************************
// App Layout
//*****************************************************************************************
export const AppLayout = () => (
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

//*****************************************************************************************
// App Store Initializers
//*****************************************************************************************

const AppStoreInit = memo(({ children }: PropsWithChildren) => children);

//*****************************************************************************************
// App Store Providers
//*****************************************************************************************

const AppStoreProviders = memo(({ children }: PropsWithChildren) => children);

export const App = memo(() => (
  <StrictMode>
    <AppStoreProviders>
      <AppStoreInit>
        <AppLayout />
      </AppStoreInit>
    </AppStoreProviders>
  </StrictMode>
));
