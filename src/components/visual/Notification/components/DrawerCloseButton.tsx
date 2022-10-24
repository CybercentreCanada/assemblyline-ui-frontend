import { IconButton } from '@material-ui/core';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import 'moment-timezone';
import 'moment/locale/fr';
import * as React from 'react';
import { useNotificationDispatch, useNotificationStyles } from '..';

export const WrappedDrawerCloseButton = () => {
  const { classes } = useNotificationStyles();
  const { dispatch } = useNotificationDispatch();

  return (
    <div className={classes.row}>
      <IconButton onClick={() => dispatch.closeDrawer()}>
        <CloseOutlinedIcon fontSize="medium" />
      </IconButton>
    </div>
  );
};

export const DrawerCloseButton = React.memo(WrappedDrawerCloseButton);
export default DrawerCloseButton;
