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
  drawer: {
    width: 700,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    [theme.breakpoints.only('xl')]: {
      width: 900
    }
  },
  drawerPaper: {
    position: 'absolute',
    flexShrink: 0,
    whiteSpace: 'nowrap',
    border: 'none'
    // backgroundColor: theme.palette.background.default,
    // [theme.breakpoints.down('md')]: {
    //   backgroundColor: theme.palette.background.paper
    // }
  },
  drawerOpen: {
    padding: theme.spacing(2),
    width: 700,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    }),
    [theme.breakpoints.down('md')]: {
      position: 'absolute',
      zIndex: 10000,
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
    },
    [theme.breakpoints.only('xl')]: {
      width: 900
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
  const isGtLg = useMediaQuery(theme.breakpoints.only('lg'));
  const [item, setItem] = useState<AlertItem>(null);

  const onItemClick = selectedItem => {
    console.log(selectedItem);
    setItem(selectedItem);
  };

  // console.log(item);.
  console.log(`isGtLg ${isGtLg}`);
  // console.log(classes.drawerOpen);....

  const hasItem = !!item;

  return (
    <Viewport>
      <div style={{ height: '100%', display: 'flex', position: 'relative', width: '100%' }}>
        <Box overflow="auto" className={classes.list}>
          <AlertList items={items} onItemClick={onItemClick} />
        </Box>
        <Box overflow="auto">
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
                [classes.drawerClose]: !hasItem,
                [classes.noBorder]: !hasItem
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
