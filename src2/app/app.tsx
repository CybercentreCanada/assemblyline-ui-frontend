import { AppAPIProvider } from 'core/api';
import { AppConfigProvider } from 'core/config';
import { AppErrorProviders } from 'core/error';
import { AppLayoutProvider } from 'core/layout';
import { AppRouterProvider } from 'core/router';
import { AppSnackbarProvider } from 'core/snackbar';
import { AppThemeProvider } from 'core/theme';
import { AppAppsLayout } from 'layout/apps/apps.layout';
import { AppAuthLayout } from 'layout/auth';
import { AppTemplateLayout } from 'layout/template';
import { StrictMode } from 'react';
import i18n from './app.i18n';

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

export const AppLayout = () => (
  <AppAuthLayout>
    <AppAppsLayout>
      <AppTemplateLayout>App</AppTemplateLayout>
    </AppAppsLayout>
  </AppAuthLayout>
);

export const App = () => (
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
