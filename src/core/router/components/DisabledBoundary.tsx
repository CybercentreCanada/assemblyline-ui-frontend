import { useAppConfigStore } from 'core/config';
import { getRouteParamFromKey, useAppLocationParamStore, useAppPageKey } from 'core/router';
import type { ComponentType, MemoExoticComponent, PropsWithChildren, ReactNode } from 'react';
import { memo } from 'react';
import { ForbiddenPage } from 'routes/forbidden/forbidden';
import { toElement } from 'shared/utils/app.utils';

export type DisabledBoundaryProps = PropsWithChildren<{
  /** Condition or callback to determine disabled state. */
  disabled?: (location: unknown, config: AppConfigStore) => boolean;
  /** Fallback component to render when disabled. */
  FallbackComponent?: ReactNode | MemoExoticComponent<ComponentType<unknown>>;
}>;

export const DisabledBoundary = memo(
  ({ disabled = () => false, FallbackComponent = <ForbiddenPage disabled />, children }: DisabledBoundaryProps) => {
    const pageKey = useAppPageKey();
    const params = useAppLocationParamStore(s => getRouteParamFromKey(s, pageKey));
    const isDisabled = useAppConfigStore(s => disabled(params, s));
    return isDisabled ? <>{toElement(FallbackComponent)}</> : <>{children}</>;
  }
);

DisabledBoundary.displayName = 'DisabledBoundary';
