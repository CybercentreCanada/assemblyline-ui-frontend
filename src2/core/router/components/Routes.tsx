import { Page1 } from 'pages/Page1';
import React, { useMemo } from 'react';
import { Route, Routes as RouterRoutes } from 'react-router';
import { APP_ROUTES } from '../store/routes';

export type RoutesProps = {
  href: string;
  state?: any;
};

export const Routes = React.memo(({ href, state }: RoutesProps) => {
  const { pathname, search, hash } = useMemo(() => new URL(href, window.location.origin), [href]);

  return (
    <RouterRoutes location={{ pathname, search, hash, state }}>
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
  );
});
