import { Router } from 'core/router/components/Router';
import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router';

export const AssemblylineApp = () => (
  <StrictMode>
    <BrowserRouter basename="/">
      <div style={{ backgroundColor: 'black', color: 'white', width: '100vw', height: '100vh' }}>
        <div style={{ padding: '16px' }}>
          <div style={{ textAlign: 'center' }}>Assemblyline App</div>
          {/* <AppRoutes location="/page1" /> */}
          <Router />
        </div>
      </div>
    </BrowserRouter>
  </StrictMode>
);
