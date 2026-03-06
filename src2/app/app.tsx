import { Button } from '@mui/material';
import { AppConfigProvider } from 'core/config/config.providers';
import { AppPreferenceProvider } from 'core/preference/preference.providers';
import { AppThemeProvider } from 'core/theme/theme.provider';
import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router';

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

{
  /* <RouterProvider>
        <div style={{ backgroundColor: 'black', color: 'white', width: '100vw', height: '100vh' }}>
          <div style={{ padding: '16px' }}>
            <h1 style={{ textAlign: 'center' }}>Assemblyline App</h1>

            <AppRouter />
          </div>
        </div>
      </RouterProvider> */
}

export const AssemblylineApp = () => (
  <StrictMode>
    <BrowserRouter basename="/">
      <AppConfigProvider>
        <AppPreferenceProvider>
          <AppThemeProvider>
            <Button variant="contained">Hello MUI</Button>
          </AppThemeProvider>
        </AppPreferenceProvider>
      </AppConfigProvider>
    </BrowserRouter>
  </StrictMode>
);
