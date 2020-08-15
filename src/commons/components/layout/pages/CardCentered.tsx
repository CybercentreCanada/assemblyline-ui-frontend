import { Card, isWidthDown, makeStyles, withWidth } from '@material-ui/core';
import React from 'react';

function CardCentered({ width, children }) {
  const useStyles = makeStyles(theme => ({
    card: {
      backgroundColor: theme.palette.background.paper,
      borderRadius: '4px',
      [theme.breakpoints.down('sm')]: {
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
    <Card
      elevation={isWidthDown('xs', width) ? 0 : 4}
      className={classes.card}
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: '22rem'
      }}
    >
      {children}
    </Card>
  );
}

export default withWidth()(CardCentered);
