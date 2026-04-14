import { useMemo, type PropsWithChildren } from 'react';
import { AppUserContext, type AppUser, type AppUserContextType, type AppUserService } from '../../user';

type AppUserProviderProps<U extends AppUser> = PropsWithChildren & {
  service: AppUserService<U>;
};

const AppUserProvider = <U extends AppUser>({ service, children }: AppUserProviderProps<U>) => {
  const value: AppUserContextType<U> = useMemo(() => ({ ...service, initialized: true }), [service]);

  return <AppUserContext.Provider value={value}>{children}</AppUserContext.Provider>;
};

export default AppUserProvider;
