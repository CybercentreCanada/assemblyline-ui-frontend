import { useAppConfigStore } from 'core/config';
import { getRouteParamFromKey, useAppLocationParamStore, useAppPageKey } from 'core/router';
import type { ComponentType, MemoExoticComponent, PropsWithChildren, ReactNode } from 'react';
import { memo } from 'react';
import { ForbiddenPage } from 'routes/forbidden/forbidden';
import { toElement } from 'shared/utils/app.utils';

export type ForbiddenBoundaryProps = PropsWithChildren<{
  /** Condition or callback to determine forbidden state. */
  forbidden?: (location: unknown, config: AppConfigStore) => boolean;
  /** Fallback component to render when forbidden. */
  FallbackComponent?: ReactNode | MemoExoticComponent<ComponentType<unknown>>;
}>;

export const ForbiddenBoundary = memo(
  ({ forbidden = () => false, FallbackComponent = <ForbiddenPage />, children }: ForbiddenBoundaryProps) => {
    const pageKey = useAppPageKey();
    const params = useAppLocationParamStore(s => getRouteParamFromKey(s, pageKey));
    const isForbidden = useAppConfigStore(s => forbidden(params, s));
    return isForbidden ? <>{toElement(FallbackComponent)}</> : <>{children}</>;
  }
);

ForbiddenBoundary.displayName = 'ForbiddenBoundary';
