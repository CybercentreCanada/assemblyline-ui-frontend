import type { ComponentType, MemoExoticComponent, ReactNode } from 'react';
import React from 'react';

const DefaultForbiddenRouteFallback = React.memo(() => {
  return 'forbidden';
});

type ForbiddenRouteProps = {
  forbidden?: boolean | (() => boolean);
  fallback?: ReactNode | MemoExoticComponent<ComponentType<any>>;
  children: ReactNode | MemoExoticComponent<ComponentType<any>>;
};

export const ForbiddenRoute = ({
  forbidden = false,
  fallback = DefaultForbiddenRouteFallback,
  children
}: ForbiddenRouteProps) => {
  if (typeof forbidden === 'function' ? forbidden() : forbidden) return <>{fallback}</>;
  return <>{children}</>;
};
