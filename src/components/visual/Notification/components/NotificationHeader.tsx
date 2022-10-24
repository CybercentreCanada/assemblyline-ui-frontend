import { Divider, Typography } from '@material-ui/core';
import ChatBubbleOutlineIcon from '@material-ui/icons/ChatBubbleOutline';
import clsx from 'clsx';
import React from 'react';
import { useNotificationStyles } from '..';

export const WrappedNotificationHeader = () => {
  const { classes } = useNotificationStyles();

  return (
    <>
      <div className={clsx(classes.row, classes.header)}>
        <ChatBubbleOutlineIcon className={clsx(classes.icon)} fontSize="medium" />
        <Typography className={clsx(classes.headerTitle)} variant={'h6'}>
          {'Notifications'}
        </Typography>
      </div>
      <Divider className={clsx(classes.divider, classes.dividerMargin)} variant="fullWidth" />
    </>
  );
};

export const NotificationHeader = React.memo(WrappedNotificationHeader);
export default NotificationHeader;
