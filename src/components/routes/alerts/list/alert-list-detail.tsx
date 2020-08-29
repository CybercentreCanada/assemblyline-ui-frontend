import { Box, Drawer, makeStyles, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import clsx from 'clsx';
import PageHeader from 'commons/components/layout/pages/PageHeader';
import { AlertItem } from 'components/routes/alerts/alerts';
import AlertDetails from 'components/routes/alerts/list/alert-details';
import AlertList from 'components/routes/alerts/list/alert-list';
import Viewport from 'components/routes/alerts/viewport';
import React, { useState } from 'react';

const useStyles = makeStyles(theme => ({
  drawer: {
    width: 500,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    [theme.breakpoints.up('xl')]: {
      width: 700
    },
    [theme.breakpoints.up('xl')]: {
      width: 900
    }
  },
  drawerPaper: {
    position: 'absolute',
    flexShrink: 0,
    whiteSpace: 'nowrap',
    border: 'none',
    backgroundColor: theme.palette.background.default,
    [theme.breakpoints.up('xs')]: {
      boxShadow:
        theme.palette.type === 'dark'
          ? `-4px 0 4px -2px ${theme.palette.grey[900]}`
          : `-4px 0 4px -2px ${theme.palette.grey[500]}`
    }
  },
  drawerOpen: {
    width: 500,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    }),
    [theme.breakpoints.up('lg')]: {
      width: 700
    },
    [theme.breakpoints.up('xl')]: {
      width: 900
    },
    [theme.breakpoints.down('md')]: {
      position: 'absolute',
      zIndex: theme.zIndex.appBar,
      top: 0,
      right: 0,
      bottom: 0
    },
    [theme.breakpoints.down('sm')]: {
      position: 'fixed',
      width: '100vw',
      zIndex: 10000,
      top: 0,
      right: 0,
      bottom: 0
    }
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    overflowX: 'hidden',
    width: 0
  },
  noBorder: {
    border: 'none'
  },
  list: {
    flexGrow: 1
  },
  drawerTemporary: {
    backgroundColor: theme.palette.background.default,
    [theme.breakpoints.down('xs')]: {
      width: '100vw'
    }
  },
  resizeAnchor: {
    padding: '5px',
    backgroundColor: 'silver',
    '&:hover': {
      cursor: 'col-resize'
    }
  },
  '@global': {
    '*::-webkit-scrollbar': {
      width: '0.4em'
    },
    '*::-webkit-scrollbar-track': {
      '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.00)'
    },
    '*::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(0,0,0,.1)',
      outline: '1px solid slategrey'
    }
  }
}));

type AlertListDetailProps = {
  items: AlertItem[];
};

const AlertListDetail: React.FC<AlertListDetailProps> = ({ items }) => {
  const classes = useStyles();
  const theme = useTheme();
  const isSTEMedium = useMediaQuery(theme.breakpoints.down('md'));
  const [state, setState] = useState<{ open: boolean; item: AlertItem }>({ open: false, item: null });

  const onItemClick = selectedItem => {
    setState({ open: true, item: selectedItem });
  };

  return (
    <Viewport>
      <div style={{ height: '100%', display: 'flex', position: 'relative', width: '100%' }}>
        <Box overflow="auto" className={classes.list}>
          <AlertList items={items} selected={state.item && state.open ? state.item : null} onItemClick={onItemClick} />
        </Box>
        <Box overflow="auto">
          {isSTEMedium ? (
            <DrawerTemporary {...state} setOpen={_open => setState({ ...state, open: _open })} />
          ) : (
            <DrawerPermanent {...state} setOpen={_open => setState({ ...state, open: _open })} />
          )}
        </Box>
      </div>
    </Viewport>
  );
};

const DrawerPermanent: React.FC<{ item: AlertItem; open: boolean; setOpen: (open: boolean) => void }> = ({
  item,
  open,
  setOpen
}) => {
  const theme = useTheme();
  const classes = useStyles();
  return (
    <Drawer
      open={open}
      variant="permanent"
      anchor="right"
      className={clsx(classes.drawer, {
        [classes.drawerOpen]: open,
        [classes.drawerClose]: !open
      })}
      classes={{
        paper: clsx(classes.drawerPaper, {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open
        })
      }}
    >
      {open ? (
        <div>
          <PageHeader
            mode="provided"
            title={
              <Box display="flex" pl={1}>
                <Typography variant="h6">{item.file.name}</Typography>
              </Box>
            }
            actions={[{ icon: <CloseIcon />, action: () => setOpen(false) }]}
            backgroundColor={theme.palette.background.default}
            elevation={0}
            isSticky
          />
          <Box p={2}>
            <AlertDetails item={item} />
          </Box>
        </div>
      ) : null}
    </Drawer>
  );
};

const DrawerTemporary: React.FC<{ item: AlertItem; open: boolean; setOpen: (open: boolean) => void }> = ({
  item,
  open,
  setOpen
}) => {
  const theme = useTheme();
  const classes = useStyles();
  return (
    <Drawer open={open} anchor="right" onClose={() => setOpen(false)}>
      {item ? (
        <Box className={classes.drawerTemporary}>
          <PageHeader
            mode="provided"
            title={
              <Box display="flex" pl={1}>
                <Typography variant="h6">{item.file.name}</Typography>
              </Box>
            }
            actions={[{ icon: <CloseIcon />, action: () => setOpen(false) }]}
            backgroundColor={theme.palette.background.default}
            elevation={0}
            isSticky
          />
          <Box p={2}>
            <AlertDetails item={item} />
          </Box>
        </Box>
      ) : (
        <div>Closing...</div>
      )}
    </Drawer>
  );
};

export default AlertListDetail;
