import { AppAPIProvider } from 'core/api';
import { AppAuthProvider } from 'core/auth/auth.providers';
import { AppConfigProvider } from 'core/config';
import { AppLayoutProvider } from 'core/layout/providers/AppLayoutProvider';
import { AppLayoutRoot } from 'core/layout/providers/AppLayoutRoot';
import { AppRouterProvider } from 'core/router';
import { AppSnackbarProvider } from 'core/snackbar/snackbar.providers';
import { AppRoot } from 'layout/AppRoot';
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

export const AssemblylineApp = () => (
  <StrictMode>
    <AppConfigProvider>
      <AppAPIProvider>
        <AppLayoutRoot i18n={i18n}>
          <AppSnackbarProvider>
            <AppRouterProvider>
              <AppAuthProvider>
                <AppLayoutProvider>
                  <AppRoot />
                </AppLayoutProvider>
              </AppAuthProvider>
            </AppRouterProvider>
          </AppSnackbarProvider>
        </AppLayoutRoot>
      </AppAPIProvider>
    </AppConfigProvider>
  </StrictMode>
);
