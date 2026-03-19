import { Button } from '@mui/material';
import { useAppConfigSetStore } from 'core/config/config.providers';
import React, { PropsWithChildren } from 'react';

export const AppRoot = React.memo(({ children }: PropsWithChildren) => {
  const setStore = useAppConfigSetStore();

  return (
    <Button
      onClick={() => {
        setStore(s => {
          s.auth.mode = 'logout';
          return s;
        });
      }}
    >
      Logout
    </Button>
  );
});
