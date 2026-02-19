import { getRegisteredRoutes } from 'core/router/store/router.store';
import { Page1 } from 'pages/Page1';
import Page2 from 'pages/Page2';
import Page3 from 'pages/Page3';
import React from 'react';
import type { RoutesProps as RouterRoutesProps } from 'react-router';
import { Route, Routes as RouterRoutes } from 'react-router';

export type RoutesProps = {
  location?: RouterRoutesProps['location'];
};

export const Routes = React.memo(({ location }: RoutesProps) => {
  const registeredRoutes = getRegisteredRoutes();

  console.log(registeredRoutes);

  return (
    <RouterRoutes location={location}>
      {/* {registeredRoutes.map(route => {
        const RegisteredRoute = route.route;
        return <RegisteredRoute key={route.path} />;
      })} */}
      <Route path="/page1" element={<Page1 />} />
      {Page2.route}
      {Page3.route}
      <Route path="*" element={'null'} />
    </RouterRoutes>
  );
});
