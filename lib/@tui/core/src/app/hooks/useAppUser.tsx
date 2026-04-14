import { useContext } from 'react';
import { AppUserContext, type AppUser, type AppUserContextType } from '../../user';

export const useAppUser = <U extends AppUser>(): AppUserContextType<U> => {
  return useContext(AppUserContext) as AppUserContextType<U>;
};
