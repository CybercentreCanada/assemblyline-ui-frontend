import { useAppConfig } from 'core/config';

export const useAppUser = () => {
  return useAppConfig(s => s.user);
};

export default useAppUser;
