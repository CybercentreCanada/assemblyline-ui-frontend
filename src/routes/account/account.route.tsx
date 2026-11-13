import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { createAppRoute } from 'core/router';
import { useAppUser } from 'core/template/components/app/hooks';
import type { CustomUser } from 'models/api/user';
import User from 'routes/user/user.route';

export default function Account() {
  const { user: currentUser } = useAppUser<CustomUser>();
  return <User username={currentUser.username} />;
}

export const AccountRoute = createAppRoute({
  component: <Account />,

  path: '/account',

  ancestor: null,
  shortname: () => ['app_route.account.shortname', { ns: 'user' }],
  fullname: () => ['app_route.account.fullname', { ns: 'user' }],
  shorticon: () => <AccountCircleOutlinedIcon />,
  fullicon: () => <AccountCircleOutlinedIcon />,

  disabled: () => false,
  forbidden: (_location, config) => !config.user.roles.includes('self_manage')
});
