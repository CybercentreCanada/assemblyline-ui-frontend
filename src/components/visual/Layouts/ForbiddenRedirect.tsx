import useALContext from 'components/hooks/useALContext';
import type { Role } from 'components/models/base/user';
import ForbiddenPage from 'components/routes/403';
import React from 'react';

export type ForbiddenRedirectProps = {
  children?: React.ReactNode;
  enabled?: boolean;
  roles?: Role[];
};

export const ForbiddenRedirect: React.FC<ForbiddenRedirectProps> = React.memo(
  ({ children = null, enabled = true, roles = [] }: ForbiddenRedirectProps) => {
    const { user: currentUser } = useALContext();

    return enabled || roles.every(r => currentUser.roles.includes(r)) ? children : <ForbiddenPage />;
  }
);
