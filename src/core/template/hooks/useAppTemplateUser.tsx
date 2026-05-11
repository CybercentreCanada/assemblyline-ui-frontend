import type { AppUserService } from '@tui/core';
import { useMemo } from 'react';

export const useAppTemplateUser = () => {
  return useMemo<AppUserService<{ id: string; name: string }>>(
    (): AppUserService<{ id: string; name: string }> => ({
      isReady: () => true,
      user: { id: 'test', name: 'test' },
      setUser: () => {},
      validateProps: () => true
    }),
    []
  );
};
