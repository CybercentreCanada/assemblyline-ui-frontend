import { Backdrop, useTheme } from '@mui/material';
import { AppDrawer } from 'commons/components/app/AppDrawer';
import { useAppDrawer } from 'commons/components/app/hooks';
import type { FC, PropsWithChildren } from 'react';

export const AppDrawerContainer: FC<PropsWithChildren> = ({ children }) => {
  const drawer = useAppDrawer();
  const theme = useTheme();
  const isFloating = drawer.mode === 'float';

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'row', height: '100%' }}>
      <div style={{ flex: 1, overflow: 'auto' }}>{children}</div>
      <div
        style={{
          height: '100%',
          width: drawer.isOpen && !drawer.isFloatThreshold && !isFloating ? drawer.width : 0,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen
          })
        }}
      >
        {drawer.isOpen && (drawer.isFloatThreshold || drawer.maximized || isFloating) && (
          <Backdrop open sx={{ zIndex: theme.zIndex.drawer + 1 }} />
        )}
        <AppDrawer />
      </div>
    </div>
  );
};
