import { APP_ROUTES } from 'app/app.routes';
import { memo, useMemo } from 'react';
import { Route, Routes } from 'react-router';
import type { AppRouteLocation } from './routes.models';

//*****************************************************************************************
// App Routes
//*****************************************************************************************
export type AppRoutesProps = AppRouteLocation;

export const AppRoutes = memo(({ href, state }: AppRoutesProps) => {
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

AppRoutes.displayName = 'AppRoutes';
