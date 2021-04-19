import useUser from 'commons/components/hooks/useAppUser';
import { CustomUser } from 'components/hooks/useMyUser';
import User from 'components/routes/user';

export default function Account() {
  const { user: currentUser } = useUser<CustomUser>();
  return <User username={currentUser.username} />;
}
