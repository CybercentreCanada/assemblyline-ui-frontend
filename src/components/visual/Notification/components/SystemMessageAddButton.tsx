import { Button, makeStyles, useTheme } from '@material-ui/core';
import useALContext from 'components/hooks/useALContext';
import 'moment-timezone';
import 'moment/locale/fr';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
// import Moment from 'react-moment';
import { useNotification } from '..';

const useStyles = makeStyles(theme => ({
  drawer: {
    width: '80%',
    maxWidth: '500px',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  },
  main: {
    height: '100%',
    width: '100%',
    overflowX: 'hidden',
    pageBreakBefore: 'avoid',
    pageBreakInside: 'avoid',
    // padding: theme.spacing(2.5),
    paddingLeft: theme.spacing(2.5),
    paddingRight: theme.spacing(2.5),
    paddingBottom: theme.spacing(2.5)
  },
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    alignContent: 'stretch',
    flexWrap: 'nowrap'
  },
  skeleton: {
    height: '2rem',
    width: '100%'
  }
}));

type Props = {};

const WrappedSystemMessageAddButton: React.FC<Props> = () => {
  const classes = useStyles();
  const theme = useTheme();
  const { t, i18n } = useTranslation(['adminFeeds']);

  const { systemMessage, user: currentUser } = useALContext();
  const { setSystemMessageDialog } = useNotification();

  return systemMessage === null && currentUser !== null && currentUser.is_admin ? (
    <Button variant="contained" color="primary" onClick={() => setSystemMessageDialog(true)}>
      Add System Message
    </Button>
  ) : null;

  // return (
  //   <Button variant="contained" color="primary" onClick={() => setSystemMessageDialog(true)}>
  //     Add System Message
  //   </Button>
  // );

  // return (
  //   <Drawer anchor="right" classes={{ paper: classes.drawer }} open={drawer} onClose={() => setDrawer(false)}>
  //     <div className={classes.main}>
  //       <div className={classes.container}>
  //         <NotificationClose />

  //         <NotificationHeader title="System Message" icon={<NotificationsIcon fontSize="medium" />} />

  //         <Button variant="contained" color="primary" onClick={() => setSystemMessageDialog(true)}>
  //           Add System Message
  //         </Button>

  //         <SystemMessageItem />

  //         <NotificationHeader title="Notifications" icon={<ChatBubbleIcon fontSize="medium" />} />
  //         {notifications === null ? (
  //           <Skeleton className={classes.skeleton} />
  //         ) : notifications.length === 0 ? (
  //           <NotificationEmpty text="There are no notifications." />
  //         ) : (
  //           notifications.map((notification, i) => (
  //             <NotificationItem key={i} notification={notification} hideDivider={i === notifications.length - 1} />
  //           ))
  //         )}
  //       </div>
  //     </div>
  //   </Drawer>
  // );
};

export const SystemMessageAddButton = React.memo(WrappedSystemMessageAddButton);
export default SystemMessageAddButton;
