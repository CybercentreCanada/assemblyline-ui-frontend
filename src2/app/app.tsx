import { RouterProvider } from 'core/router/router/router.provider';
import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router';
import { AppRouter } from './app.router';

export const AssemblylineApp = () => (
  <StrictMode>
    <BrowserRouter basename="/">
      <RouterProvider>
        <div style={{ backgroundColor: 'black', color: 'white', width: '100vw', height: '100vh' }}>
          <div style={{ padding: '16px' }}>
            <h1 style={{ textAlign: 'center' }}>Assemblyline App</h1>
            {/* <AppRoutes location="/page1" /> */}
            <AppRouter />
          </div>
        </div>
      </RouterProvider>
    </BrowserRouter>
  </StrictMode>
);
