import { IconButton, makeStyles, useMediaQuery, useTheme } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import useAppLayout from 'commons/components/hooks/useAppLayout';
import React from 'react';

const useStyles = makeStyles(theme => ({
  topBarTitle: {
    display: 'flex',
    alignItems: 'center',
    flex: '0 0 auto',
    fontSize: '1.5rem',
    letterSpacing: '-1px',
    textDecoration: 'none'
    // color: theme.palette.text.primary
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    padding: '0',
    [theme.breakpoints.down('xs')]: {
      display: 'none'
    }
  }
}));

export default function AppTitle({ disabled = false, noTitle = false }) {
  const theme = useTheme();
  const classes = useStyles();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const { layoutProps, getLogo, toggleDrawer } = useAppLayout();

  const renderIcon = () => {
    if (isXs) {
      return (
        <IconButton aria-label="open drawer" onClick={toggleDrawer} edge="start" color="inherit">
          <MenuIcon />
        </IconButton>
      );
    }
    return <div className={classes.icon}>{getLogo(theme)}</div>;
  };

  //
  if (!disabled) {
    return (
      <div className={classes.topBarTitle} style={{ paddingLeft: theme.spacing(2) }}>
        {renderIcon()}
        {!noTitle && <div style={{ marginLeft: theme.spacing(isXs ? 2 : 4) }}>{layoutProps.appName}</div>}
      </div>
    );
  }
  return null;
}
