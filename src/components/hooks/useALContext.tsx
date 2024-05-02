import { AppUserContext } from 'commons/components/app/providers/AppUserProvider';
import type { CustomAppUserService } from 'components/hooks/useMyUser';
import { useContext } from 'react';

export default function useALContext(): CustomAppUserService {
  return useContext(AppUserContext) as CustomAppUserService;
}
