import { Typography } from '@mui/material';
import { useAppConfigStore } from 'core/config';
import type { SystemVersionProps } from 'layout/system-version';
import { memo } from 'react';

//*****************************************************************************************
// SystemVersion
//*****************************************************************************************

export const SystemVersion = memo(({ className = 'no-print', style }: SystemVersionProps) => {
  const system = useAppConfigStore(s => s?.configuration?.system);

  return !(system && system.type !== 'production') ? null : (
    <Typography
      className={className}
      variant="body2"
      style={{
        position: 'fixed',
        bottom: '8px',
        marginLeft: '32px',
        opacity: '0.4',
        zIndex: 10000,
        marginTop: 'auto',
        marginRight: 'auto',
        pointerEvents: 'none',
        ...style
      }}
    >
      {`Assemblyline ${system.version} :: `}
      <span style={{ textTransform: 'capitalize' }}>{system.type}</span>
    </Typography>
  );
});

SystemVersion.displayName = 'SystemVersion';
