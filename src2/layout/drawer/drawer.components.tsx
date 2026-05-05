import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import DoubleArrowOutlinedIcon from '@mui/icons-material/DoubleArrowOutlined';
import { Drawer, styled, useMediaQuery, useTheme } from '@mui/material';
import type { CSSProperties, PropsWithChildren } from 'react';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton } from 'ui/buttons/IconButton';
import { useAppDrawerClose, useIsDrawerOpen } from './drawer.hooks';
import { useAppDrawerStore, useAppSetDrawerStore } from './drawer.providers';

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

export const AppDrawerActions = memo(
  styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    columnGap: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(1),
    position: 'sticky',
    top: 0,
    zIndex: 5
  }))
);

export const AppDrawerInner = memo(
  styled('div')(({ theme }) => ({
    height: '100%',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  }))
);

export const AppDrawerCloseButton = memo(() => {
  const { t } = useTranslation(['drawer']);

  const handleClose = useAppDrawerClose();

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

  const isMaximized = useAppDrawerStore(s => s.maximized);

  const setDrawerConfig = useAppSetDrawerStore();

  const transition = useMemo<CSSProperties['transition']>(
    () =>
      `${theme.transitions.create(['width'], {
        duration: theme.transitions.duration.shortest,
        easing: theme.transitions.easing.easeOut
      })} !important`,
    [theme]
  );

  const handleMaximize = useCallback(() => {
    setDrawerConfig(s => {
      s.maximized = !s.maximized;
      return s;
    });
  }, [setDrawerConfig]);

  if (!isXL) return null;

  return (
    <IconButton tooltip={isMaximized ? t('minimize') : t('maximize')} size="large" onClick={handleMaximize}>
      <DoubleArrowOutlinedIcon
        sx={{
          transform: 'rotate(180deg)',
          transition,
          ...(isMaximized && {
            transform: 'rotate(0deg)'
          })
        }}
      />
    </IconButton>
  );
});

AppDrawerMaximizeButton.displayName = 'AppDrawerMaximizeButton';

export const AppDrawerContainer = memo(({ children }: PropsWithChildren) => {
  const theme = useTheme();

  const open = useIsDrawerOpen();
  const isMaximized = useAppDrawerStore(s => s.maximized);
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
      ModalProps={{ disableEnforceFocus: true }}
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
