import { Box } from '@material-ui/core';
import useUser from 'commons/components/hooks/useAppUser';
import { CustomUser } from 'components/hooks/useMyUser';
import ForbiddenPage from 'components/routes/403';
import React from 'react';

export default function Users() {
  const { user: currentUser } = useUser<CustomUser>();

  return currentUser.is_admin ? <Box>Users</Box> : <ForbiddenPage />;
}
