import { Drawer, makeStyles, useTheme } from '@material-ui/core';
import 'moment-timezone';
import 'moment/locale/fr';
import React from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(theme => ({
  drawer: {
    width: '80%',
    maxWidth: '800px',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  }
}));

export const WrappedNotificationApp = () => {
  const classes = useStyles();
  const theme = useTheme();
  const { t, i18n } = useTranslation(['adminFeeds']);

  const [notificationDrawer, setNotificationDrawer] = React.useState(true);

  return (
    <Drawer
      anchor="right"
      classes={{ paper: classes.drawer }}
      open={notificationDrawer}
      onClose={() => setNotificationDrawer(false)}
    >
      Notification Drawer
      {/* <List component="nav">
        <div style={{ padding: theme.spacing(2) }} />
        <LayoutFeedHeader />
        <Divider className={classes.divider} variant="fullWidth" />
        <NotificationAdminItem />
        <Divider className={classes.divider} variant="fullWidth" />
        <NotificationItem />
        <Divider className={classes.divider} variant="fullWidth" />

        <div style={{ paddingLeft: theme.spacing(2), paddingRight: theme.spacing(2) }}>
          <div className={classes.section_content}>
            {feeds
              .map(f => f.items)
              .flat()
              .sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf())
              .map((feedItem, i) => (
                <FeedItemView key={'item-' + i} item={feedItem} />
              ))}
          </div>
        </div>
      </List> */}
    </Drawer>
  );
};

export const NotificationApp = React.memo(WrappedNotificationApp);
export default NotificationApp;
