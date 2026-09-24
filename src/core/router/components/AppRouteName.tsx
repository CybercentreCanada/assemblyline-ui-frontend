import type { RouteName } from 'core/router';
import type { ReactNode } from 'react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

export type AppRouteNameProps = {
  /** Route path fallback, shown when no name is resolved. */
  fallback?: ReactNode;
  /** Result of a route's `shortname`/`fullname` resolver. */
  name?: RouteName;
};

export const AppRouteName = memo(({ fallback = null, name }: AppRouteNameProps) => {
  const { t } = useTranslation();
  return !name ? <>{fallback}</> : <>{t(name?.[0], name?.[1])}</>;
});

AppRouteName.displayName = 'AppRouteName';
