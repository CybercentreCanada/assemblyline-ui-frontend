import { useAppUser } from 'deprecated/legacy/commons/components/app/hooks';
import type { CustomUser } from 'models/api/user';
import User from 'routes/user/user.route';

export default function Account() {
  const { user: currentUser } = useAppUser<CustomUser>();
  return <User username={currentUser.username} />;
}
