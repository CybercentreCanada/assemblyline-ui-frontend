import useUser from 'commons/components/hooks/useAppUser';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import useMyLayout from 'components/hooks/useMyLayout';
import { CustomUser } from 'components/hooks/useMyUser';
import LinkGrid from 'components/layout/linkgrid';
import React from 'react';
import { Redirect } from 'react-router-dom';

export default function Admin() {
  const layout = useMyLayout();
  const { user: currentUser } = useUser<CustomUser>();

  return currentUser.is_admin ? (
    <PageCenter>
      <LinkGrid items={layout.topnav.adminMenu} />
    </PageCenter>
  ) : (
    <Redirect to="/forbidden" />
  );
}
