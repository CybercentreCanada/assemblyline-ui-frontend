import { UserContext, UserContextProps, UserProfileProps } from 'commons/components/user/UserProvider';
import { useContext } from 'react';

export default function useAppUser<U extends UserProfileProps>(): UserContextProps<U> {
  return useContext(UserContext) as UserContextProps<U>;
}
