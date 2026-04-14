import { Backdrop, useTheme } from '@mui/material';
import { type FC, type PropsWithChildren } from 'react';
import { useAppDrawer } from '../hooks/useAppDrawer';
import { useDrawerWidth } from '../hooks/useDrawerWidth';
import { AppDrawer } from './AppDrawer';

export const AppDrawerContainer: FC<PropsWithChildren> = ({ children }) => {
  const theme = useTheme();
  const drawer = useAppDrawer();
  const { minimizedWidth } = useDrawerWidth();
  const isFloating = drawer.mode === 'float' || drawer.isFloatThreshold;

  return (
    <div
      id="drawer.container.root"
      style={{ position: 'relative', display: 'flex', flexDirection: 'row', height: '100%' }}
    >
      <div style={{ flex: 1, overflow: 'auto' }}>{children}</div>
      <div
        style={{
          height: '100%',
          width: drawer.isOpen && !isFloating ? minimizedWidth : 0,
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
