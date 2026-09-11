import { useAppConfigStore } from 'core/config';

export const useAppUser = () => {
  return useAppConfigStore(s => s.user);
};

export default useAppUser;
