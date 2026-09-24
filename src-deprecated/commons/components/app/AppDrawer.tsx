import { Close, DoubleArrow } from '@mui/icons-material';
import { Box, ClickAwayListener, IconButton, Paper, Stack, useMediaQuery, useTheme } from '@mui/material';
import { AppDrawerElementContext } from 'commons/components/app/AppContexts';
import { useAppDrawer } from 'commons/components/app/hooks';
import { useCallback, useContext } from 'react';

export const AppDrawer = () => {
  const theme = useTheme();
  const drawer = useAppDrawer();
  const drawerElement = useContext(AppDrawerElementContext);
  const isSm = useMediaQuery(theme.breakpoints.down('md'));

  const onClickAway = useCallback(() => {
    if (drawer.enableClickAway) {
      drawer.close();
    }
  }, [drawer]);

  return (
    <Box
      sx={{
        position: 'fixed',
        zIndex: theme.zIndex.drawer + 2,
        top: 0,
        right: 0,
        bottom: 0,
        overflowX: 'auto',
        width: drawer.isOpen ? drawer.width : 0,
        borderLeft: '1px solid',
        borderColor: theme.palette.divider,
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen
        }),
        ...(!drawer.isOpen && {
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen
          })
        }),
        ...((drawer.isFloatThreshold || drawer.maximized) && {
          width: drawer.isOpen ? (isSm ? '100vw' : '90vw') : 0
        })
      }}
    >
      <Paper sx={{ height: '100%', boxShadow: 'none' }}>
        <Stack component="div" direction="row" sx={{ height: '100%', width: '100%' }}>
          {drawer.isOpen && (
            <ClickAwayListener onClickAway={onClickAway}>
              <Stack direction="column" flex={1} height="fit-content">
                <Paper
                  sx={theme => ({ position: 'sticky', top: 0, boxShadow: 'none', zIndex: theme.zIndex.drawer + 1 })}
                  elevation={1}
                >
                  <Stack direction="row" alignItems="center" spacing={1} m={1}>
                    {!drawer.isFloatThreshold && (
                      <IconButton onClick={() => drawer.setMaximized(!drawer.maximized)}>
                        <DoubleArrow sx={{ transform: !drawer.maximized && 'rotate(180deg)' }} />
                      </IconButton>
                    )}
                    <Box flex={1} />
                    <IconButton onClick={drawer.close}>
                      <Close />
                    </IconButton>
                  </Stack>
                </Paper>
                <Box flex={1}>
                  <Paper sx={{ boxShadow: 'none' }}>{drawerElement}</Paper>
                </Box>
              </Stack>
            </ClickAwayListener>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};
