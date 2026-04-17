import { type AppUserService, type AppUserValidatedProp } from '@tui/core';
import { useMemo, useState } from 'react';
import type { User } from '~/models';

// Application specific hook that will provide configuration to commons [useUser] hook.
export default function useMyUser(): AppUserService<User> {
  // Store user in state.
  const [user, setUser] = useState<User>();

  // We memoize the user config object to prevent unnecessary updates to user provider value.
  return useMemo(
    () => ({
      user,
      setUser,
      isReady: () => !!user,
      validateProps: (props: AppUserValidatedProp[]) => {
        if (props === undefined) return true;
        return props.every((propDef: AppUserValidatedProp) => user[propDef.prop] === propDef.value);
      }
    }),
    [user, setUser]
  );
}
