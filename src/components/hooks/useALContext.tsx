import { UserContext } from 'commons/components/user/UserProvider';
import { CustomUserContextProps } from 'components/hooks/useMyUser';
import { useContext } from 'react';

export default function useALContext(): CustomUserContextProps {
  return useContext(UserContext) as CustomUserContextProps;
}
