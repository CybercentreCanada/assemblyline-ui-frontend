import { createStyles, fade, Theme, withStyles } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import 'moment/locale/fr';
import React from 'react';

const StyledAlert = withStyles((theme: Theme) =>
  createStyles({
    root: {
      marginbottom: theme.spacing(2),
      marginTop: theme.spacing(4),
      color: theme.palette.text.secondary,
      backgroundColor: fade(theme.palette.text.primary, 0.04)
    },
    icon: {
      color: `${theme.palette.text.secondary} !important`
    },
    message: {
      width: '100%',
      textAlign: 'left'
    }
  })
)(Alert);

const InformativeAlert = ({ children, ...props }) => {
  return (
    <StyledAlert {...props} severity="info">
      {children}
    </StyledAlert>
  );
};

export default InformativeAlert;
