import { AppNavigate } from 'core/router';
import useALContext from 'deprecated/hooks/useALContext';
import type { Role } from 'models/base/user';
import React from 'react';
import { ForbiddenPage } from 'routes/forbidden/forbidden';

export type ForbiddenRedirectProps = {
  children?: React.ReactNode;
  enabled?: boolean;
  redirect?: boolean;
  roles?: Role[];
};

export const ForbiddenRedirect: React.FC<ForbiddenRedirectProps> = React.memo(
  ({ children = null, enabled = true, redirect = false, roles = [] }: ForbiddenRedirectProps) => {
    const { user: currentUser } = useALContext();

    return enabled || roles.every(r => currentUser.roles.includes(r)) ? (
      children
    ) : redirect ? (
      <AppNavigate nav={nav => nav.here({ replace: true }).update({ route: '/forbidden' })} />
    ) : (
      <ForbiddenPage />
    );
  }
);
