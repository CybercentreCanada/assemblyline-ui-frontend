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

export const AssemblylineApp = () => (
  <StrictMode>
    <BrowserRouter basename="/">
      <AppThemeProvider />
      {/* <RouterProvider>
        <div style={{ backgroundColor: 'black', color: 'white', width: '100vw', height: '100vh' }}>
          <div style={{ padding: '16px' }}>
            <h1 style={{ textAlign: 'center' }}>Assemblyline App</h1>

            <AppRouter />
          </div>
        </div>
      </RouterProvider> */}
    </BrowserRouter>
  </StrictMode>
);
