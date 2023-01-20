import { UserContext, UserContextProps, UserProfileProps } from 'commons_deprecated/components/user/UserProvider';
import { useContext } from 'react';

export default function useAppUser<U extends UserProfileProps>(): UserContextProps<U> {
  const context = useContext(UserContext) as UserContextProps<U>;
  if (context) {
    return context;
  }
  return {
    user: null,
    setUser: user => null,
    isReady: () => false
  };
}
