import useUser from 'commons/components/hooks/useAppUser';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import useMyLayout from 'components/hooks/useMyLayout';
import { CustomUser } from 'components/hooks/useMyUser';
import LinkGrid from 'components/layout/linkgrid';
import ForbiddenPage from 'components/routes/403';
import React from 'react';

export default function Admin() {
  const layout = useMyLayout();
  const { user: currentUser } = useUser<CustomUser>();

  return currentUser.is_admin ? (
    <PageCenter>
      <LinkGrid items={layout.topnav.adminMenu} />
    </PageCenter>
  ) : (
    <ForbiddenPage />
  );
}
