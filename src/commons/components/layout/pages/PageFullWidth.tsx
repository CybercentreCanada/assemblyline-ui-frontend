import { makeStyles } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles(theme => ({
  page: {
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: 'auto',
    // marginTop: theme.spacing(6),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '95%'
    }
  }
}));

export default function PageFullWidth({ children }) {
  const classes = useStyles();
  return <div className={classes.page}>{children}</div>;
}
