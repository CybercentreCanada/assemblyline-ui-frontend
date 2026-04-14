import { useMemo } from 'react';

export const useSSR = () => {
  return useMemo(
    () => ({
      isSSR: typeof window === 'undefined'
    }),
    []
  );
};
