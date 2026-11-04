import { Typography, useTheme } from '@mui/material';
import { useAppConfigStore } from 'core/config';
import type { SystemVersionProps } from 'layout/system-version';
import { memo } from 'react';

//*****************************************************************************************
// SystemVersion
//*****************************************************************************************

export const SystemVersion = memo(({ className = 'no-print', style }: SystemVersionProps) => {
  const theme = useTheme();

  const systemType = useAppConfigStore(s => s?.configuration?.system?.type);
  const systemVersion = useAppConfigStore(s => s?.configuration?.system?.version);

  return systemType === 'production' ? null : (
    <Typography
      className={className}
      variant="body2"
      style={{
        position: 'fixed',
        bottom: theme.spacing(1),
        opacity: 0.4,
        zIndex: 10000,
        pointerEvents: 'none',
        ...style
      }}
    >
      {`Assemblyline ${systemVersion} :: `}
      <span style={{ textTransform: 'capitalize' }}>{systemType}</span>
    </Typography>
  );
});

SystemVersion.displayName = 'SystemVersion';
