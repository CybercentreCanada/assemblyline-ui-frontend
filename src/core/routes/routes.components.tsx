import type { ComponentType, MemoExoticComponent, ReactNode } from 'react';
import { memo } from 'react';

//*****************************************************************************************
// DisabledBoundary
//*****************************************************************************************
const DefaultDisabledRouteFallback = memo(() => {
  return 'disabled';
});

DefaultDisabledRouteFallback.displayName = 'DefaultDisabledRouteFallback';

type DisabledBoundaryProps = {
  /** Condition or callback to determine disabled state. */
  disabled?: boolean | (() => boolean);
  /** Fallback component to render when disabled. */
  FallbackComponent?: ReactNode | MemoExoticComponent<ComponentType<unknown>>;
  /** Children to render when not disabled. */
  children: ReactNode | MemoExoticComponent<ComponentType<unknown>>;
};

export const DisabledBoundary = memo(
  ({ disabled = false, FallbackComponent = DefaultDisabledRouteFallback, children }: DisabledBoundaryProps) => {
    return (typeof disabled === 'function' ? disabled() : disabled) ? <>{FallbackComponent}</> : <>{children}</>;
  }
);

DisabledBoundary.displayName = 'DisabledBoundary';

//*****************************************************************************************
// ForbiddenBoundary
//*****************************************************************************************

const DefaultForbiddenRouteFallback = memo(() => {
  return 'forbidden';
});

DefaultForbiddenRouteFallback.displayName = 'DefaultForbiddenRouteFallback';

type ForbiddenBoundaryProps = {
  /** Condition or callback to determine forbidden state. */
  forbidden?: boolean | (() => boolean);
  /** Fallback component to render when forbidden. */
  FallbackComponent?: ReactNode | MemoExoticComponent<ComponentType<unknown>>;
  /** Children to render when not forbidden. */
  children: ReactNode | MemoExoticComponent<ComponentType<unknown>>;
};

export const ForbiddenBoundary = memo(
  ({ forbidden = false, FallbackComponent = DefaultForbiddenRouteFallback, children }: ForbiddenBoundaryProps) => {
    return (typeof forbidden === 'function' ? forbidden() : forbidden) ? <>{FallbackComponent}</> : <>{children}</>;
  }
);

ForbiddenBoundary.displayName = 'ForbiddenBoundary';
