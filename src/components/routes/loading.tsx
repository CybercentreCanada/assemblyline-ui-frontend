import { CircularProgress, useTheme } from '@material-ui/core';
import useAppLayout from 'commons/components/hooks/useAppLayout';
import React from 'react';

function LoadingScreen() {
  const theme = useTheme();
  const { getBanner } = useAppLayout();

  return (
    <div
      style={{
        textAlign: 'center',
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }}
    >
      {getBanner(theme)}
      <CircularProgress variant="indeterminate" />
    </div>
  );
}

export default LoadingScreen;
