import md5 from 'md5';
import { useMemo } from 'react';

export const useGravatar = (email: string) => {
  const gravatar = useMemo<string>(() => {
    if (email !== null) {
      return `https://s.gravatar.com/avatar/${md5(email)}?d=404`;
    }
    return null;
  }, [email]);

  return gravatar;
};
export default useGravatar;
