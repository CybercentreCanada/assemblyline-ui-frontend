import { makeStyles, Typography } from '@material-ui/core';
import React from 'react';

const useStyles = () =>
  makeStyles(theme => ({
    container: {
      flex: 1,
      paddingTop: theme.spacing(2.5),
      paddingBottom: theme.spacing(2.5),
      alignSelf: 'center'
    }
  }))();

type Props = {
  text: string;
};

export const WrappedNotificationEmpty = ({ text = '' }: Props) => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <Typography variant="body2" color="secondary">
        {text}
      </Typography>
    </div>
  );
};

export const NotificationEmpty = React.memo(WrappedNotificationEmpty);
export default NotificationEmpty;
