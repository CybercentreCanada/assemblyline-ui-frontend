import { Box, Drawer, makeStyles, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import DescriptionIcon from '@material-ui/icons/Description';
import clsx from 'clsx';
import PageHeader from 'commons/components/layout/pages/PageHeader';
import { AlertItem } from 'components/routes/alerts/alerts';
import AlertDetails from 'components/routes/alerts/list/alert-details2';
import AlertList from 'components/routes/alerts/list/alert-list';
import Viewport from 'components/routes/alerts/viewport';
import React, { useState } from 'react';

const useStyles = makeStyles(theme => ({
  // drawer: {
  //   position: 'relative',
  //   flexShrink: 0,
  //   whiteSpace: 'nowrap'
  // },
  // drawerPaper: {
  //   padding: theme.spacing(1),
  //   position: 'absolute',
  //   flexShrink: 0,
  //   whiteSpace: 'nowrap'
  // },
  // drawerOpen: {
  //   width: theme.breakpoints.up('lg') ? 800 : 0,
  //   transition: theme.transitions.create('width', {
  //     easing: theme.transitions.easing.sharp,
  //     duration: theme.transitions.duration.enteringScreen
  //   })
  // },
  // drawerClose: {
  //   transition: theme.transitions.create('width', {
  //     easing: theme.transitions.easing.sharp,
  //     duration: theme.transitions.duration.leavingScreen
  //   }),
  //   overflowX: 'hidden',
  //   width: 0
  // },
  // left: {
  //   maxWidth: '100%',
  //   flexGrow: 1
  // },
  // right: {
  //   flexGrow: 0,
  //   backgroundColor: theme.palette.background.paper,
  //   [theme.breakpoints.down('md')]: {
  //     position: 'absolute',
  //     zIndex: 1000,
  //     top: 0,
  //     right: 0,
  //     bottom: 0
  //   }
  // },
  rightContent: {
    // padding: theme.spacing(2)
    // width: 600
  },
  // rightDrawer: {
  //   position: 'absolute'
  // }
  drawer: {
    // position: 'relative',
    width: 900,
    flexShrink: 0,
    whiteSpace: 'nowrap'
  },
  drawerPaper: {
    position: 'absolute',
    flexShrink: 0,
    whiteSpace: 'nowrap',
    border: 'none',
    backgroundColor: theme.palette.background.default
  },
  drawerOpen: {
    padding: theme.spacing(2),
    width: 900,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    }),
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
  list: {
    flexGrow: 1
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
  const isUpMd = useMediaQuery(theme.breakpoints.up('lg'));
  const [item, setItem] = useState<AlertItem>(null);

  const onItemClick = selectedItem => {
    console.log(selectedItem);
    setItem(selectedItem);
  };

  // console.log(item);.
  // console.log(isUpMd);
  // console.log(classes.drawerOpen);....

  const hasItem = !!item;

  return (
    <Viewport>
      <div style={{ height: '100%', display: 'flex', position: 'relative' }}>
        <Box overflow="auto" className={classes.list}>
          <AlertList items={items} onItemClick={onItemClick} />
        </Box>
        <Box overflow="auto" position="relative">
          <Drawer
            open={!!item}
            variant="permanent"
            anchor="right"
            className={clsx(classes.drawer, {
              [classes.drawerOpen]: hasItem,
              [classes.drawerClose]: !hasItem
            })}
            classes={{
              paper: clsx(classes.drawerPaper, {
                [classes.drawerOpen]: hasItem,
                [classes.drawerClose]: !hasItem
              })
            }}
          >
            {item ? (
              <div className={classes.list}>
                <PageHeader
                  mode="provided"
                  title={
                    <Box display="flex">
                      <DescriptionIcon />
                      <Typography>{item.file.name}</Typography>
                    </Box>
                  }
                  actions={[{ icon: <CloseIcon />, action: () => setItem(null) }]}
                />
                <AlertDetails item={item} />
              </div>
            ) : null}
          </Drawer>
        </Box>
      </div>
    </Viewport>
  );

  // return (
  //   <div style={{ position: 'relative' }}>
  //     <AlertList items={items} onItemClick={onItemClick} />
  //     <Drawer variant="persistent" anchor="right" open={!!item} className={classes.rightDrawer}>
  //       {item ? (
  //         <div className={classes.rightContent}>
  //           <Box onClick={() => setItem(null)}>Close</Box>
  //           <AlertDetails item={item} />
  //         </div>
  //       ) : null}
  //     </Drawer>
  //   </div>
  // );

  // return (
  //   <Viewport>
  //     <Box height="100%" display="flex" flexDirection="row" position="relative">
  //       <Box overflow="auto" className={classes.left}>
  //         <AlertList items={items} onItemClick={onItemClick} />
  //       </Box>
  //       <Box overflow="auto" className={classes.right}>
  //         {item ? (
  //           <div className={classes.rightContent}>
  //             <Box onClick={() => setItem(null)}>Close</Box>
  //             <Box>{item.sid}</Box>
  //             <Box>
  //               Lorem, ipsum dolor sit amet consectetur adipisicing elit. Ipsam, molestiae quaerat tempora eligendi
  //               dicta corporis qui libero at commodi repudiandae inventore soluta laudantium architecto voluptatibus
  //               eius odio saepe nemo. Vitae!
  //             </Box>
  //           </div>
  //         ) : null}
  //       </Box>
  //     </Box>
  //   </Viewport>

  // const hasItem = !!item;.
  // return (
  //   <Viewport>
  //     <Box height="100%" display="flex" flexDirection="row">
  //       <Box flex="1 1 auto" overflow="auto">
  //         <AlertList items={items} onItemClick={onItemClick} />
  //       </Box>
  //       <Box display="flex" flex="0 0 auto" overflow="auto">
  //         <Drawer
  //           variant="permanent"
  //           anchor="right"
  //           className={clsx(classes.drawer, {
  //             [classes.drawerOpen]: hasItem,
  //             [classes.drawerClose]: !hasItem
  //           })}
  //           classes={{
  //             paper: clsx(classes.drawerPaper, {
  //               [classes.drawerOpen]: hasItem,
  //               [classes.drawerClose]: !hasItem
  //             })
  //           }}
  //         >
  //           {item ? (
  //             <Box>
  //               <Box onClick={() => setItem(null)}>Close</Box>
  //               <AlertDetails item={item} />
  //             </Box>
  //           ) : null}
  //         </Drawer>
  //       </Box>
  //     </Box>
  //   </Viewport>
  // );
};

export default AlertListDetail;
