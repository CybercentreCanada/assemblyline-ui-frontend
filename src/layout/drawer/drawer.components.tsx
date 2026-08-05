import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import DoubleArrowOutlinedIcon from '@mui/icons-material/DoubleArrowOutlined';
import { Drawer, styled, useMediaQuery, useTheme } from '@mui/material';
import { useAppInterfaceStore } from 'core/interface';
import { useAppNavigate } from 'core/router';
import { useAppDrawerClose, useIsDrawerOpen } from 'layout/drawer/drawer.hooks';
import type { CSSProperties, PropsWithChildren } from 'react';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton } from 'ui/buttons/IconButton';

const APP_DRAWER_WIDTHS: {
  xl: CSSProperties['width'];
  lg: CSSProperties['width'];
  md: CSSProperties['width'];
  sm: CSSProperties['width'];
  maximized: CSSProperties['width'];
} = {
  xl: '45vw',
  lg: '75%',
  md: '85%',
  sm: '100%',
  maximized: '90vw'
};

export const AppDrawerMain = memo(
  styled('div')(() => ({
    '@media print': {
      overflow: 'unset !important'
    },
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    position: 'relative',
    overflowX: 'hidden',
    WebkitTransform: 'translate3d(0, 0, 0)'
  }))
);

AppDrawerMain.displayName = 'AppDrawerMain';

export const AppDrawerContent = memo(
  styled('div')(() => ({
    '@media print': {
      overflow: 'unset !important'
    },
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    flex: 1,
    height: '100%',
    overflowX: 'hidden'
  }))
);

AppDrawerContent.displayName = 'AppDrawerContent';

export const AppDrawerActions = memo(
  styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    columnGap: theme.spacing(1),
    padding: theme.spacing(1)
  }))
);

AppDrawerActions.displayName = 'AppDrawerActions';

export const AppDrawerCloseButton = memo(() => {
  const { t } = useTranslation(['drawer']);
  const navigate = useAppNavigate();

  const handleClose = useCallback(() => {
    navigate.at(1).closePanel(true);
  }, [navigate]);

  return (
    <IconButton tooltip={t('close')} size="large" onClick={handleClose}>
      <CloseOutlinedIcon />
    </IconButton>
  );
});

AppDrawerCloseButton.displayName = 'AppDrawerCloseButton';

export const AppDrawerMaximizeButton = memo(() => {
  const { t } = useTranslation(['drawer']);
  const theme = useTheme();
  const isXL = useMediaQuery(theme.breakpoints.only('xl'));
  const navigate = useAppNavigate();

  const handleMoveToLeft = useCallback(() => {
    navigate.at(0).closePanel(true);
  }, [navigate]);

  return !isXL ? null : (
    <IconButton tooltip={t('moveToLeft')} size="large" onClick={handleMoveToLeft}>
      <DoubleArrowOutlinedIcon sx={{ transform: 'rotate(180deg)' }} />
    </IconButton>
  );
});

AppDrawerMaximizeButton.displayName = 'AppDrawerMaximizeButton';

export const AppDrawerContainer = memo(({ children }: PropsWithChildren) => {
  const theme = useTheme();

  const open = useIsDrawerOpen();
  const isMaximized = useAppInterfaceStore(s => s.drawer.maximized);
  const handleClose = useAppDrawerClose();

  const isMD = useMediaQuery(theme.breakpoints.only('md'));
  const isLG = useMediaQuery(theme.breakpoints.only('lg'));
  const isXL = useMediaQuery(theme.breakpoints.only('xl'));

  const drawerWidth = useMemo<CSSProperties['width']>(
    () =>
      isMaximized
        ? APP_DRAWER_WIDTHS.maximized
        : isXL
          ? APP_DRAWER_WIDTHS.xl
          : isLG
            ? APP_DRAWER_WIDTHS.lg
            : isMD
              ? APP_DRAWER_WIDTHS.md
              : APP_DRAWER_WIDTHS.sm,
    [isMaximized, isMD, isLG, isXL]
  );

  const contentWidth = useMemo<CSSProperties['width']>(
    () =>
      !open
        ? 0
        : isXL
          ? APP_DRAWER_WIDTHS.xl
          : isLG
            ? APP_DRAWER_WIDTHS.lg
            : isMD
              ? APP_DRAWER_WIDTHS.md
              : APP_DRAWER_WIDTHS.sm,
    [isMD, isLG, isXL, open]
  );

  const transition = useMemo<CSSProperties['transition']>(
    () =>
      `${theme.transitions.create(['width'], {
        duration: theme.transitions.duration.shortest,
        easing: theme.transitions.easing.easeOut
      })} !important`,
    [theme]
  );

  return (
    <Drawer
      open={open}
      anchor="right"
      variant={isXL ? 'persistent' : 'temporary'}
      sx={{
        width: contentWidth,
        transition
      }}
      ModalProps={{ disableEnforceFocus: isXL }}
      onClose={handleClose}
      slotProps={{
        root: {
          sx: {
            '@media print': {
              display: 'none'
            }
          }
        },
        paper: {
          sx: {
            boxShadow: 'none',
            backgroundImage: 'none',
            width: drawerWidth,
            transition
          }
        }
      }}
    >
      {children}
    </Drawer>
  );
});

AppDrawerContainer.displayName = 'AppDrawerContainer';
