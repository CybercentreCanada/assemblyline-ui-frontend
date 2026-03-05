import Page1Route from 'pages/Page1';
import Page2Route from 'pages/Page2';
import SubmissionsRoute from 'pages/Submissions';
import SubmitRoute from 'pages/Submit';
import React, { useMemo } from 'react';
import { Route, Routes as RouterRoutes } from 'react-router';

//*****************************************************************************************
// AppRoutes
//*****************************************************************************************
export const APP_ROUTES = [SubmitRoute, Page1Route, Page2Route, SubmissionsRoute] as const;

export type AppRoute = (typeof APP_ROUTES)[number];

export type RoutesProps = {
  href: string;
  state?: any;
};

export const AppRoutes = React.memo(({ href, state }: RoutesProps) => {
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
