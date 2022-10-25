import { Divider, makeStyles, Typography } from '@material-ui/core';
import LaunchOutlinedIcon from '@material-ui/icons/LaunchOutlined';
import PriorityHighIcon from '@material-ui/icons/PriorityHigh';
import clsx from 'clsx';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { Link } from 'react-router-dom';
import { FeedItem } from '.';

const useStyles = makeStyles(theme => ({
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    paddingTop: theme.spacing(1.25),
    paddingBottom: theme.spacing(1.25)
  },
  header: {
    width: '100%',
    display: 'flex',
    alignItems: 'center'
  },
  time: { lineHeight: 'revert' },
  icon: { color: theme.palette.warning.main },
  link: {
    width: '100%',
    flex: 1,
    overflow: 'hidden',
    textDecoration: 'none'
  },
  title: {
    flex: 1,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  launch: {
    color: theme.palette.primary.main,
    transition: 'color 225ms cubic-bezier(0, 0, 0.2, 1) 0ms',
    '&:hover': {
      color: theme.palette.type === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark
    }
  },
  description: {
    overflow: 'hidden',
    display: '-webkit-box',
    '-webkit-line-clamp': 3,
    '-webkit-box-orient': 'vertical'
  },
  divider: {
    width: '95%',
    '@media print': {
      backgroundColor: '#0000001f !important'
    }
  }
}));

type Props = {
  notification?: FeedItem;
  hideDivider?: boolean;
};

const WrappedNotificationItem = ({ notification = null, hideDivider = false }: Props) => {
  const classes = useStyles();
  const { i18n } = useTranslation('alerts');

  if (notification === null) return <></>;
  else
    return (
      <>
        <div className={classes.container}>
          <Typography className={classes.time} variant="caption" color="secondary">
            {/* <Moment locale={i18n.language} format={'MMMM Do YYYY, h:mm:ss a'}> */}
            <Moment locale={i18n.language} fromNow>
              {notification.pubDate}
            </Moment>
          </Typography>
          <div className={classes.header}>
            {notification.isNew && <PriorityHighIcon classes={{ root: clsx(classes.icon) }} fontSize="small" />}
            {notification.link ? (
              <Link
                className={clsx(classes.link)}
                to={{ pathname: notification.link }}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Typography
                  className={clsx(classes.title, classes.launch)}
                  variant="body1"
                  color="primary"
                  dangerouslySetInnerHTML={{ __html: notification.title }}
                />
              </Link>
            ) : (
              <Typography
                className={classes.title}
                variant="body1"
                color="primary"
                dangerouslySetInnerHTML={{ __html: notification.title }}
              />
            )}
            {notification.link && (
              <Link
                className={clsx(classes.launch)}
                to={{ pathname: notification.link }}
                target="_blank"
                rel="noopener noreferrer"
              >
                <LaunchOutlinedIcon fontSize="small" />
              </Link>
            )}
          </div>
          <Typography
            className={classes.description}
            variant="body2"
            color="textPrimary"
            dangerouslySetInnerHTML={{ __html: notification.description }}
          />
        </div>
        {!hideDivider && <Divider className={classes.divider} variant="fullWidth" />}
      </>
    );
};

export const NotificationItem = React.memo(WrappedNotificationItem);
export default NotificationItem;
