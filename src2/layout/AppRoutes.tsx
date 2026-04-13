import { APP_ROUTES } from 'app/app.routes';
import React, { useMemo } from 'react';
import { Route, Routes } from 'react-router';

export type RoutesProps = {
  href: string;
  state?: any;
};

export const AppRoutes = React.memo(({ href, state }: RoutesProps) => {
  const { pathname, search, hash } = useMemo(() => new URL(href, window.location.origin), [href]);

  return (
    <Routes location={{ pathname, search, hash, state }}>
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
    </Routes>
  );
});
