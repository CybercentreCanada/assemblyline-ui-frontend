import { useAppConfig } from 'core/config';
import { ForbiddenPage } from 'pages/forbidden/forbidden';
import { NotFoundPage } from 'pages/not-found/not-found';
import type { ComponentType, MemoExoticComponent, ReactNode } from 'react';
import { memo } from 'react';

//*****************************************************************************************
// DisabledBoundary
//*****************************************************************************************

export type DisabledBoundaryProps = {
  /** Condition or callback to determine disabled state. */
  disabled?: boolean | ((config: AppConfigStore) => boolean);
  /** Fallback component to render when disabled. */
  FallbackComponent?: ReactNode | MemoExoticComponent<ComponentType<unknown>>;
  /** Children to render when not disabled. */
  children: ReactNode | MemoExoticComponent<ComponentType<unknown>>;
};

export const DisabledBoundary = memo(
  ({ disabled = false, FallbackComponent = <NotFoundPage />, children }: DisabledBoundaryProps) => {
    const isDisabled = useAppConfig(s => (typeof disabled === 'function' ? disabled(s) : disabled));
    return isDisabled ? <>{FallbackComponent}</> : <>{children}</>;
  }
);

DisabledBoundary.displayName = 'DisabledBoundary';

//*****************************************************************************************
// ForbiddenBoundary
//*****************************************************************************************

export type ForbiddenBoundaryProps = {
  /** Condition or callback to determine forbidden state. */
  forbidden?: boolean | ((config: AppConfigStore) => boolean);
  /** Fallback component to render when forbidden. */
  FallbackComponent?: ReactNode | MemoExoticComponent<ComponentType<unknown>>;
  /** Children to render when not forbidden. */
  children: ReactNode | MemoExoticComponent<ComponentType<unknown>>;
};

export const ForbiddenBoundary = memo(
  ({ forbidden = false, FallbackComponent = <ForbiddenPage />, children }: ForbiddenBoundaryProps) => {
    const isForbidden = useAppConfig(s => (typeof forbidden === 'function' ? forbidden(s) : forbidden));
    return isForbidden ? <>{FallbackComponent}</> : <>{children}</>;
  }
);

ForbiddenBoundary.displayName = 'ForbiddenBoundary';
