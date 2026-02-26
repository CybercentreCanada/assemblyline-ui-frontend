import Page1Route from 'pages/Page1';
import Page2Route from 'pages/Page2';
import SubmissionsRoute from 'pages/Submissions';
import React, { useMemo } from 'react';
import { Route, Routes as RouterRoutes } from 'react-router';

// export type Routes =
//   | { path: '/search'; params?: never; search: { query: string; offset: number; rows: number }; hash?: never }
//   | { path: '/detail/:id'; params: { id: string }; search?: never; hash?: never }
//   | { path: '/viewer/:id'; params: { id: string }; search?: never; hash: string };

export const APP_ROUTES = [Page1Route, Page2Route, SubmissionsRoute] as const;

export type AppRoutes = typeof APP_ROUTES;

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
      <Route path="*" element={'null'} />
    </RouterRoutes>
  );
});
