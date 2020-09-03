import useUser from 'commons/components/hooks/useAppUser';
import useMyLayout from 'components/hooks/useMyLayout';
import { CustomUser } from 'components/hooks/useMyUser';
import LinkGrid from 'components/layout/linkgrid';
import ForbiddenPage from 'components/routes/403';
import React from 'react';

export default function Admin() {
  const layout = useMyLayout();
  const { user: currentUser } = useUser<CustomUser>();

  return currentUser.is_admin ? <LinkGrid items={layout.topnav.adminMenu} /> : <ForbiddenPage />;
}
