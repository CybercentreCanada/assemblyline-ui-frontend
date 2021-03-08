import { UserContext } from 'commons/components/user/UserProvider';
import { useContext } from 'react';
import { CustomUserContextProps } from 'components/hooks/useMyUser';

export default function useAppContext(): CustomUserContextProps {
  return useContext(UserContext) as CustomUserContextProps;
}
