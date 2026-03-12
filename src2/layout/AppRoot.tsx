import React from 'react';
import { AppAuth } from './AppAuth';

export const AppRoot = React.memo(({}) => {
  return <AppAuth>what</AppAuth>;

  // return <LoginPage allowUserPass={false} allowSAML={false} allowSignup={false} />;

  // return <AppRouter />;

  // return (
  //   <div style={{ height: '100vh', width: '100vw', display: 'flex', placeItems: 'center', justifyItems: 'center' }}>
  //     <Button variant="contained">Hello MUI</Button>
  //     <AppRouter />
  //   </div>
  // );

  // return (
  //   <>
  //     <h1 style={{ textAlign: 'center' }}>Assemblyline App</h1>
  //     <div>
  //       <Button variant="contained">Hello MUI</Button>
  //     </div>
  //     <AppRouter />
  //   </>
  // );
});
