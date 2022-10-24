import { Divider, makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import React from 'react';

const useStyles = () =>
  makeStyles(theme => ({
    divider: {
      width: '100%',
      '@media print': {
        backgroundColor: '#0000001f !important'
      }
    }
  }))();

type Props = {
  classes?: {
    divider: string;
  };
};

export const WrappedNotificationDivider = ({ classes = { divider: null } }: Props) => {
  const _classes = useStyles();

  return <Divider className={clsx(_classes.divider, classes.divider)} variant="fullWidth" />;
};

export const NotificationDivider = React.memo(WrappedNotificationDivider);
export default NotificationDivider;
