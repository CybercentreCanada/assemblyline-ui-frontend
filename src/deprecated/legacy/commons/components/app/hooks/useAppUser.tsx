import { useContext } from 'react';
import type { AppUser, AppUserService } from 'deprecated/legacy/commons/components/app/AppUserService';
import { AppUserContext } from 'deprecated/legacy/commons/components/app/AppContexts';

export function useAppUser<U extends AppUser>(): AppUserService<U> {
  return useContext(AppUserContext) as AppUserService<U>;
}
