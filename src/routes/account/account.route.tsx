import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { createAppRoute } from 'core/routes';
import useALContext from 'deprecated/hooks/useALContext';
import { memo } from 'react';
import { UserPage } from 'routes/user/user.route';

type AccountPageProps = {
  disabled?: boolean;
};

export const AccountPage = memo(({ disabled = false }: AccountPageProps) => {
  const { user: currentUser } = useALContext();
  return <UserPage username={currentUser.username} />;
});

AccountPage.displayName = 'AccountPage';

export const AccountRoute = createAppRoute({
  title: {
    ns: 'app',
    key: 'usermenu.account'
  },
  icon: {
    primary: <AccountCircleOutlinedIcon />
  },
  ancestor: null,
  component: AccountPage,
  path: '/account'
});
