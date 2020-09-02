import useUser from 'commons/components/hooks/useAppUser';
import { CustomUser } from 'components/hooks/useMyUser';
import UserDetail from 'components/routes/user';
import React from 'react';

export default function Account() {
  const { user: currentUser } = useUser<CustomUser>();
  return <UserDetail username={currentUser.username} />;
}
