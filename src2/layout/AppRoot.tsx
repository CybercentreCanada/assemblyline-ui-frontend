import { Button } from '@mui/material';
import { useAppSetConfig } from 'core/config/config.providers';
import React, { PropsWithChildren } from 'react';

export const AppRoot = React.memo(({ children }: PropsWithChildren) => {
  const setConfig = useAppSetConfig();

  return (
    <Button
      onClick={() => {
        setConfig(s => {
          s.auth.mode = 'logout';
          return s;
        });
      }}
    >
      Logout
    </Button>
  );
});
