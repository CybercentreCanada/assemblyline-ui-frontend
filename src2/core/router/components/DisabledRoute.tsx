import type { ComponentType, MemoExoticComponent, ReactNode } from 'react';
import React from 'react';

const DefaultDisabledRouteFallback = React.memo(() => {
  return 'disabled';
});

type DisabledRouteProps = {
  disabled?: boolean | (() => boolean);
  fallback?: ReactNode | MemoExoticComponent<ComponentType<any>>;
  children: ReactNode | MemoExoticComponent<ComponentType<any>>;
};

export const DisabledRoute = ({
  disabled = false,
  fallback = DefaultDisabledRouteFallback,
  children
}: DisabledRouteProps) => {
  if (typeof disabled === 'function' ? disabled() : disabled) return <>{fallback}</>;
  return <>{children}</>;
};
