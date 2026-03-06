import { Button } from '@mui/material';
import { AppConfigProvider } from 'core/config/config.providers';
import { AppPreferenceProvider } from 'core/preference/preference.providers';
import { AppRouterProvider } from 'core/router';
import { AppThemeProvider } from 'core/theme/theme.provider';
import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router';
import { AppRouter } from '../layout/Router';

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
    <BrowserRouter basename="/">
      <AppConfigProvider>
        <AppPreferenceProvider>
          <AppThemeProvider>
            <AppRouterProvider>
              <h1 style={{ textAlign: 'center' }}>Assemblyline App</h1>
              <div>
                <Button variant="contained">Hello MUI</Button>
              </div>
              <AppRouter />
            </AppRouterProvider>
          </AppThemeProvider>
        </AppPreferenceProvider>
      </AppConfigProvider>
    </BrowserRouter>
  </StrictMode>
);
