import { AppAPIProvider } from 'core/api';
import { AppAuthProvider } from 'core/auth/auth.providers';
import { AppConfigProvider } from 'core/config/config.providers';
import { AppLayoutProvider } from 'core/layout/layout.providers';
import { AppRouterProvider } from 'core/router';
import { AppSnackbarProvider } from 'core/snackbar/snackbar.providers';
import { AppThemeProvider } from 'core/theme';
import { AppRoot } from 'layout/AppRoot';
import { SnackbarProvider } from 'notistack';
import { StrictMode } from 'react';

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
        <AppThemeProvider>
          <AppSnackbarProvider>
            <SnackbarProvider>
              <AppRouterProvider>
                <AppAuthProvider>
                  <AppLayoutProvider>
                    <AppRoot />
                  </AppLayoutProvider>
                </AppAuthProvider>
              </AppRouterProvider>
            </SnackbarProvider>
          </AppSnackbarProvider>
        </AppThemeProvider>
      </AppAPIProvider>
    </AppConfigProvider>
  </StrictMode>
);
