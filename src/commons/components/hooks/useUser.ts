import { useContext } from 'react';
import { UserContext, UserContextProps, UserProfileProps } from '../user/UserProvider';

export default function useUser<U extends UserProfileProps>(): UserContextProps<U> {
  return useContext(UserContext) as UserContextProps<U>;
}
