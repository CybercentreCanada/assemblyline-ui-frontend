import { Divider, Typography } from '@material-ui/core';
import PriorityHighIcon from '@material-ui/icons/PriorityHigh';
import clsx from 'clsx';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { Link } from 'react-router-dom';
import { FeedItem, useNotificationStyles } from '..';

type Props = {
  notification?: FeedItem;
  hideDivider?: boolean;
};

export const WrappedNotificationItem = ({ notification = null, hideDivider = false }: Props) => {
  const { classes } = useNotificationStyles();
  const { i18n } = useTranslation('alerts');

  if (notification === null) return <></>;
  else
    return (
      <>
        <div className={classes.itemContainer}>
          <Typography variant="caption" color="secondary">
            {/* <Moment locale={i18n.language} format={'MMMM Do YYYY, h:mm:ss a'}> */}
            <Moment locale={i18n.language} fromNow>
              {notification.pubDate}
            </Moment>
          </Typography>
          <div className={clsx(classes.row)}>
            {notification.isNew && (
              <PriorityHighIcon classes={{ root: clsx(classes.colorWarning1) }} fontSize="small" />
            )}
            <Typography className={clsx(classes.notificationTitle)} variant="body1" color="primary">
              <Link
                className={classes.notificationTitleLink}
                to={{ pathname: notification.link }}
                target="_blank"
                rel="noopener noreferrer"
                dangerouslySetInnerHTML={{ __html: notification.title }}
              />
            </Typography>
          </div>
          <Typography
            className={classes.notificationDescription}
            variant="body2"
            color="textPrimary"
            dangerouslySetInnerHTML={{ __html: notification.description }}
          />
        </div>
        {!hideDivider && <Divider className={clsx(classes.dividerItem, classes.divider)} variant="fullWidth" />}
      </>
    );
};

export const NotificationItem = React.memo(WrappedNotificationItem);
export default NotificationItem;
