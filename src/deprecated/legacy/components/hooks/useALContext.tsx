import { AppUserContext } from 'deprecated/legacy/commons/components/app/AppContexts';
import type { CustomAppUserService } from 'deprecated/hooks/useALContext';
import { useContext } from 'react';

export default function useALContext(): CustomAppUserService {
  return useContext(AppUserContext) as CustomAppUserService;
}
