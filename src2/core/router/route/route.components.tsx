import type { ComponentType, MemoExoticComponent, ReactNode } from 'react';
import React from 'react';

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
