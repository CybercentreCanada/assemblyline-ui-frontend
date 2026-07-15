import { createAppRoute } from 'core/routes';
import useALContext from 'deprecated/hooks/useALContext';
import { UserPage } from 'pages/user/user.route';
import { memo } from 'react';

type AccountPageProps = {
  disabled?: boolean;
};

export const AccountPage = memo(({ disabled = false }: AccountPageProps) => {
  const { user: currentUser } = useALContext();
  return <UserPage username={currentUser.username} />;
});

AccountPage.displayName = 'AccountPage';

export const AccountRoute = createAppRoute({
  component: AccountPage,
  route: '/account'
});
