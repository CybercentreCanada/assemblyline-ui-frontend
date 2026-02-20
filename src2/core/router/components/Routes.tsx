import { Page1 } from 'pages/Page1';
import React from 'react';
import type { RoutesProps as RouterRoutesProps } from 'react-router';
import { Route, Routes as RouterRoutes } from 'react-router';
import { APP_ROUTES } from '../store/routes';

export type RoutesProps = {
  location?: RouterRoutesProps['location'];
};

export const Routes = React.memo(({ location }: RoutesProps) => (
  <RouterRoutes location={location}>
    {APP_ROUTES.map((route, i) => (
      <Route
        key={i}
        path={route.path}
        element={route.element}
        loader={() => {
          console.log('loader');
        }}
      />
    ))}

    <Route path="/page1" element={<Page1 />} />
    {/* {Page2.route} */}
    <Route path="*" element={'null'} />
  </RouterRoutes>
));
