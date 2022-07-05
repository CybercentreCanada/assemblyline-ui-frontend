import { Divider, Drawer, List, makeStyles, useTheme } from '@material-ui/core';
import 'moment-timezone';
import 'moment/locale/fr';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FeedItemView, LayoutFeedHeader, NotificationAdminItem, NotificationItem, useNewsFeed } from '../..';

const useStyles = makeStyles(theme => ({
  searchresult: {
    fontStyle: 'italic',
    paddingTop: theme.spacing(0.5),
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-end'
  },
  drawerPaper: {
    width: '80%',
    maxWidth: '800px',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  },
  result_section: {
    minWidth: '50%',
    flexGrow: 1
  },
  section_title: {
    marginTop: theme.spacing(4),
    pageBreakAfter: 'avoid',
    pageBreakInside: 'avoid'
  },
  section_content: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    pageBreakBefore: 'avoid',
    pageBreakInside: 'avoid'
  },
  section: {
    pageBreakInside: 'avoid'
  },
  divider: {
    '@media print': {
      backgroundColor: '#0000001f !important'
    }
  }
}));

type Props = {};

const WrappedLayoutFeedDrawer: React.FC<Props> = () => {
  const classes = useStyles();
  const theme = useTheme();
  const { t, i18n } = useTranslation(['adminFeeds']);

  const { feeds, feedDrawerOpen, onFeedDrawerChange } = useNewsFeed();

  return (
    <Drawer
      anchor="right"
      classes={{ paper: classes.drawerPaper }}
      open={feedDrawerOpen}
      onClose={() => onFeedDrawerChange(false)}
    >
      <List component="nav">
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
      </List>
    </Drawer>
  );
};

// export const LayoutFeedDrawer = forwardRef(WrappedLayoutFeedDrawer);
export const LayoutFeedDrawer = React.memo(WrappedLayoutFeedDrawer);
export default LayoutFeedDrawer;
