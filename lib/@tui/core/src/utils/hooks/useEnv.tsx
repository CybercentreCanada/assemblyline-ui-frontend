import { useMemo } from 'react';

export const useAppEnv = (key?: string) => {
  return useMemo(() => {
    const env = typeof process !== 'undefined' ? process.env : {};
    if (key) {
      return env[key];
    }
    return env;
  }, [key]);
};
