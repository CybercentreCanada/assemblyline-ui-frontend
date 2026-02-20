import type { ComponentType, MemoExoticComponent, ReactNode } from 'react';
import React from 'react';

const DefaultForbiddenRouteFallback = React.memo(() => {
  return 'forbidden';
});

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
