import { APP_ROUTES } from 'app/app.routes';
import type { ComponentType, MemoExoticComponent, ReactNode } from 'react';
import React, { useMemo } from 'react';
import { Route, Routes } from 'react-router';

//*****************************************************************************************
// DisabledBoundary
//*****************************************************************************************
const DefaultDisabledRouteFallback = React.memo(() => {
  return 'disabled';
});

DefaultDisabledRouteFallback.displayName = 'DefaultDisabledRouteFallback';

type DisabledBoundaryProps = {
  disabled?: boolean | (() => boolean);
  FallbackComponent?: ReactNode | MemoExoticComponent<ComponentType<any>>;
  children: ReactNode | MemoExoticComponent<ComponentType<any>>;
};

export const DisabledBoundary = ({
  disabled = false,
  FallbackComponent = DefaultDisabledRouteFallback,
  children
}: DisabledBoundaryProps) => {
  if (typeof disabled === 'function' ? disabled() : disabled) return <>{FallbackComponent}</>;
  return <>{children}</>;
};

DisabledBoundary.displayName = 'DisabledBoundary';

//*****************************************************************************************
// ForbiddenBoundary
//*****************************************************************************************

const DefaultForbiddenRouteFallback = React.memo(() => {
  return 'forbidden';
});

DefaultForbiddenRouteFallback.displayName = 'DefaultForbiddenRouteFallback';

type ForbiddenBoundaryProps = {
  forbidden?: boolean | (() => boolean);
  FallbackComponent?: ReactNode | MemoExoticComponent<ComponentType<any>>;
  children: ReactNode | MemoExoticComponent<ComponentType<any>>;
};

export const ForbiddenBoundary = ({
  forbidden = false,
  FallbackComponent = DefaultForbiddenRouteFallback,
  children
}: ForbiddenBoundaryProps) => {
  if (typeof forbidden === 'function' ? forbidden() : forbidden) return <>{FallbackComponent}</>;
  return <>{children}</>;
};

ForbiddenBoundary.displayName = 'ForbiddenBoundary';

//*****************************************************************************************
// App Routes
//*****************************************************************************************

export type AppRoute = (typeof APP_ROUTES)[number];

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
