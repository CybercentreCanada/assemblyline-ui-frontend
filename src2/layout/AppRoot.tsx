import { Button } from '@mui/material';
import React from 'react';
import { AppRouter } from './AppRouter';

export const AppRoot = React.memo(({}) => {
  return <AppRouter />;

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', placeItems: 'center', justifyItems: 'center' }}>
      <Button variant="contained">Hello MUI</Button>
      <AppRouter />
    </div>
  );

  return (
    <>
      <h1 style={{ textAlign: 'center' }}>Assemblyline App</h1>
      <div>
        <Button variant="contained">Hello MUI</Button>
      </div>
      <AppRouter />
    </>
  );
});
