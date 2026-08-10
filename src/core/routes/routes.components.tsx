import { useAppConfig } from 'core/config';
import { getRouteParamFromKey, useAppLocationParamStore, useAppPageKey } from 'core/routes';
import type { ComponentType, MemoExoticComponent, ReactNode } from 'react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ForbiddenPage } from 'routes/forbidden/forbidden';

//*****************************************************************************************
// RouteName
//*****************************************************************************************

export type RouteNameProps = {
  /** Route path fallback, shown when no name is resolved. */
  fallback?: ReactNode;
  /** Result of a route's `shortname`/`fullname` resolver. */
  name?: { i18nKey: string; ns: string };
};

export const RouteName = memo(({ fallback = null, name }: RouteNameProps) => {
  const { t } = useTranslation(name.ns);
  return !name ? <>{fallback}</> : <>{t(name.i18nKey)}</>;
});

RouteName.displayName = 'RouteName';

//*****************************************************************************************
// DisabledBoundary
//*****************************************************************************************

export type DisabledBoundaryProps = {
  /** Condition or callback to determine disabled state. */
  disabled?: (location: unknown, config: AppConfigStore) => boolean;
  /** Fallback component to render when disabled. */
  FallbackComponent?: ReactNode | MemoExoticComponent<ComponentType<unknown>>;
  /** Children to render when not disabled. */
  children: ReactNode | MemoExoticComponent<ComponentType<unknown>>;
};

export const DisabledBoundary = memo(
  ({ disabled = () => false, FallbackComponent = <ForbiddenPage disabled />, children }: DisabledBoundaryProps) => {
    const pageKey = useAppPageKey();
    const params = useAppLocationParamStore(s => getRouteParamFromKey(s, pageKey));
    const isDisabled = useAppConfig(s => disabled(params, s));
    return isDisabled ? <>{FallbackComponent}</> : <>{children}</>;
  }
);

DisabledBoundary.displayName = 'DisabledBoundary';

//*****************************************************************************************
// ForbiddenBoundary
//*****************************************************************************************

export type ForbiddenBoundaryProps = {
  /** Condition or callback to determine forbidden state. */
  forbidden?: (location: unknown, config: AppConfigStore) => boolean;
  /** Fallback component to render when forbidden. */
  FallbackComponent?: ReactNode | MemoExoticComponent<ComponentType<unknown>>;
  /** Children to render when not forbidden. */
  children: ReactNode | MemoExoticComponent<ComponentType<unknown>>;
};

export const ForbiddenBoundary = memo(
  ({ forbidden = () => false, FallbackComponent = <ForbiddenPage />, children }: ForbiddenBoundaryProps) => {
    const pageKey = useAppPageKey();
    const params = useAppLocationParamStore(s => getRouteParamFromKey(s, pageKey));
    const isForbidden = useAppConfig(s => forbidden(params, s));
    return isForbidden ? <>{FallbackComponent}</> : <>{children}</>;
  }
);

ForbiddenBoundary.displayName = 'ForbiddenBoundary';
