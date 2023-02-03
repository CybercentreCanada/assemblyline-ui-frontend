import useAppUser from 'commons/components/app/hooks/useAppUser';
import { CustomUser } from 'components/hooks/useMyUser';
import User from 'components/routes/user';

export default function Account() {
  const { user: currentUser } = useAppUser<CustomUser>();
  return <User username={currentUser.username} />;
}
