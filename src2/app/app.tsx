import { AppAPIProvider } from 'core/api';
import { AppConfigProvider } from 'core/config/config.providers';
import { AppRouterProvider } from 'core/router';
import { AppThemeProvider } from 'core/theme';
import { AppRoot } from 'layout/AppRoot';
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
          <AppRouterProvider>
            <AppRoot />
          </AppRouterProvider>
        </AppThemeProvider>
      </AppAPIProvider>
    </AppConfigProvider>
  </StrictMode>
);
