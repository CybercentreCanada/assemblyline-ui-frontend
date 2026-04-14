import { Close, DoubleArrow } from '@mui/icons-material';
import { Box, ClickAwayListener, IconButton, Paper, Stack, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDrawer } from '../hooks/useAppDrawer';
import { useDrawerWidth } from '../hooks/useDrawerWidth';
import { MODULE_NAME } from '../name';
import { AppDrawerElementContext } from '../providers/AppDrawerProvider';

export const AppDrawer = () => {
  const theme = useTheme();
  const drawer = useAppDrawer();
  const drawerElement = useContext(AppDrawerElementContext);
  const { maximizedWidth, minimizedWidth } = useDrawerWidth();
  const drawerWidth = drawer.maximized ? maximizedWidth : minimizedWidth;
  const isMdDown = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useTranslation(MODULE_NAME);

  const [visible, setVisible] = useState(false);

  const onClickAway = useCallback(() => {
    if (drawer.enableClickAway) {
      drawer.close();
    }
  }, [drawer]);

  useEffect(() => {
    if (drawer.isOpen) {
      setVisible(true);
    } else if (visible) {
      const timer = setTimeout(() => setVisible(false), theme.transitions.duration.enteringScreen);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawer.isOpen]);

  return (
    <Box
      className="tui-appdrawer"
      sx={{
        position: 'fixed',
        zIndex: theme.zIndex.drawer + 2,
        top: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        width: drawerWidth,
        transform: drawer.isOpen ? 'translateX(0)' : `translateX(${drawerWidth}px)`,
        transition: theme.transitions.create(['transform', 'width'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen
        })
      }}
    >
      {visible && (
        <ClickAwayListener onClickAway={onClickAway}>
          <Paper
            elevation={2}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              width: '100%',
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} m={1}>
              {!isMdDown && drawer.expandable && (
                <Tooltip
                  title={t(drawer.maximized ? 'button.restore.tooltip' : 'button.maximize.tooltip')}
                  placement="top"
                >
                  <IconButton
                    onClick={() => drawer.setMaximized(!drawer.maximized)}
                    aria-label={t(drawer.maximized ? 'button.restore.tooltip' : 'button.maximize.tooltip')}
                  >
                    <DoubleArrow sx={{ transform: !drawer.maximized && 'rotate(180deg)' }} />
                  </IconButton>
                </Tooltip>
              )}
              <Stack direction="row" alignItems="center" spacing={1}>
                {drawer.toolbar?.slots?.left}
              </Stack>
              <Box flex={1} />
              <Stack direction="row" alignItems="center" spacing={1}>
                {drawer.toolbar?.slots?.right}
                <Tooltip title={t('button.close.tooltip')} placement="top">
                  <IconButton
                    onClick={drawer.toolbar?.onCloseClick ?? drawer.close}
                    aria-label={t('button.close.tooltip')}
                  >
                    <Close />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
            <Box sx={{ flexGrow: 1, overflow: 'auto', width: '100%' }}>{drawerElement}</Box>
          </Paper>
        </ClickAwayListener>
      )}
    </Box>
  );
};
