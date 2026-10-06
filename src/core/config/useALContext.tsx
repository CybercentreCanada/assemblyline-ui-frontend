import { AppUserContext } from 'core/template/components/app/AppContexts';
import type { CustomAppUserService } from 'layout/auth/useALContext';
import { useContext } from 'react';

export default function useALContext(): CustomAppUserService {
  return useContext(AppUserContext) as CustomAppUserService;
}
