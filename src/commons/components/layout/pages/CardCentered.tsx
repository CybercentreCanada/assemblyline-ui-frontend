import { Card, isWidthDown, makeStyles, withWidth } from '@material-ui/core';
import React from 'react';

function CardCentered({ width, children }) {
  const useStyles = makeStyles(theme => ({
    card: {
      display: 'flex',
      flexDirection: 'column',
      position: 'absolute',
      left: '50%', // X
      top: '50%', // Y
      transform: 'translate(-50%, -50%)',
      maxWidth: '22rem',
      backgroundColor: theme.palette.background.paper,
      borderRadius: '4px',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: theme.palette.background.default,
        width: '100%',
        maxWidth: '22rem',
        padding: '0rem 1rem 3rem'
      },
      [theme.breakpoints.up('sm')]: {
        width: '22rem',
        padding: '0 2rem 3rem'
      }
    }
  }));
  const classes = useStyles();

  return (
    <Card elevation={isWidthDown('xs', width) ? 0 : 4} className={classes.card}>
      {children}
    </Card>
  );
}

export default withWidth()(CardCentered);
