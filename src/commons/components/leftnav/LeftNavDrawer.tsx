import AssistantIcon from '@mui/icons-material/Assistant';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {
  Badge,
  Box,
  ClickAwayListener,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  styled,
  Tooltip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import useAppConfigs from 'commons/components/app/hooks/useAppConfigs';
import useAppLeftNav from 'commons/components/app/hooks/useAppLeftNav';
import LeftNavGroup from 'commons/components/leftnav/LeftNavGroup';
import LeftNavItem from 'commons/components/leftnav/LeftNavItem';
import useAssistant from 'components/hooks/useAssistant';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLeftNavGroup, AppLeftNavItem } from '../app/AppConfigs';
import AppName from '../topnav/AppName';

const StyledDrawer = styled(Drawer, { shouldForwardProp: prop => prop !== 'open' && prop !== 'width' })<{
  open: boolean;
  width: number;
}>(({ theme, open, width }) => ({
  width,
  flexShrink: 0,
  height: '100%',
  whiteSpace: 'nowrap',
  '@media print': {
    display: 'none !important'
  },
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen
  }),
  ...(!open && {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    overflowX: 'hidden',
    width: 0,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(7)
    },
    [theme.breakpoints.only('xs')]: {
      border: 'none'
    }
  }),
  '& .MuiDrawer-paper': {
    width,
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    }),
    ...(!open && {
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
      }),
      overflowX: 'hidden',
      width: 0,
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(7)
      },
      [theme.breakpoints.only('xs')]: {
        border: 'none'
      }
    })
  }
}));

const LeftNavDrawer = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { preferences } = useAppConfigs();
  const { assistantAllowed, hasInsights, toggleAssistant } = useAssistant();
  const leftnav = useAppLeftNav();
  const isSmDown = useMediaQuery(theme.breakpoints.down('md'));

  const onCloseDrawerIfOpen = useCallback(() => {
    if (isSmDown && leftnav.open) {
      leftnav.setOpen(false);
    }
  }, [isSmDown, leftnav]);

  return (
    <ClickAwayListener mouseEvent="onMouseDown" touchEvent="onTouchStart" onClickAway={onCloseDrawerIfOpen}>
      <StyledDrawer
        PaperProps={{ elevation: 1 }}
        variant="permanent"
        style={{ height: '100%' }}
        width={preferences.leftnav.width}
        open={leftnav.open}
      >
        <AppName onCloseDrawerIfOpen={onCloseDrawerIfOpen} />

        <Divider />

        <List disablePadding>
          {leftnav.elements.map((e, i) => {
            if (e.type === 'item') {
              const item = e.element as AppLeftNavItem;
              return <LeftNavItem key={item.id} item={item} onClick={isSmDown && onCloseDrawerIfOpen} />;
            }
            if (e.type === 'group') {
              const item = e.element as AppLeftNavGroup;
              return <LeftNavGroup key={item.id} group={item} onItemClick={isSmDown && onCloseDrawerIfOpen} />;
            }
            if (e.type === 'divider') {
              return <Divider key={`divider-${i}`} />;
            }
            return null;
          })}
        </List>

        <Divider />

        <Tooltip title={leftnav.open ? '' : t('drawer.expand')} aria-label={t('drawer.expand')} placement="right">
          <List disablePadding>
            <ListItem button key="chevron" onClick={leftnav.toggle}>
              <ListItemIcon>{leftnav.open ? <ChevronLeftIcon /> : <ChevronRightIcon />}</ListItemIcon>
              <ListItemText primary={t('drawer.collapse')} />
            </ListItem>
          </List>
        </Tooltip>

        <Box
          sx={{
            height: '100%',
            width: '100%',
            '&:hover': {
              cursor: 'pointer'
            }
          }}
          onClick={leftnav.toggle}
        />
        <Divider />

        {!isSmDown && assistantAllowed && (
          <Tooltip title={leftnav.open ? '' : t('title', { ns: 'assistant' })} placement="right">
            <List disablePadding>
              <ListItem
                button
                key="chevron"
                onClick={event => {
                  onCloseDrawerIfOpen();
                  toggleAssistant(event.currentTarget, 'right-end');
                }}
              >
                <ListItemIcon>
                  <Badge variant="dot" invisible={!hasInsights} color="primary">
                    <AssistantIcon />
                  </Badge>
                </ListItemIcon>
                <ListItemText primary={t('title', { ns: 'assistant' })} />
              </ListItem>
            </List>
          </Tooltip>
        )}
      </StyledDrawer>
    </ClickAwayListener>
  );
};

export default memo(LeftNavDrawer);
