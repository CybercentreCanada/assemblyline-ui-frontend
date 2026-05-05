import { useAppConfig } from 'core/config';
import type { Role } from 'models/base/user';
import { ForbiddenPage } from 'pages/forbidden/forbidden.route';
import type { ReactNode } from 'react';
import { memo } from 'react';
import { Navigate } from 'react-router';

export type ForbiddenRedirectProps = {
  children?: ReactNode;
  enabled?: boolean;
  redirect?: boolean;
  roles?: Role[];
};

export const ForbiddenRedirect = memo(
  ({ children = null, enabled = true, redirect = false, roles = [] }: ForbiddenRedirectProps) => {
    const currentUser = useAppConfig(s => s.user);

    return enabled || roles.every(r => currentUser.roles.includes(r)) ? (
      children
    ) : redirect ? (
      <Navigate to="/forbidden" replace />
    ) : (
      <ForbiddenPage />
    );
  }
);

ForbiddenRedirect.displayName = 'ForbiddenRedirect';
