import { ClickAwayListener, Fade, IconButton, makeStyles, Paper, Popper, useTheme } from '@material-ui/core';
import TuneIcon from '@material-ui/icons/Tune';
import ThemeSelection from 'commons/components/layout/topnav/ThemeSelection';
import React, { useState } from 'react';

const useStyles = () => {
  return makeStyles(theme => ({
    popper: {
      zIndex: theme.zIndex.drawer + 2,
      minWidth: '280px'
    }
  }))();
};

const ThemeSelectionIcon = () => {
  const theme = useTheme();
  const classes = useStyles();
  const [popperAnchorEl, setPopperAnchorEl] = useState(null);

  const onThemeSelectionClick = (event: React.MouseEvent) => {
    setPopperAnchorEl(popperAnchorEl ? null : event.currentTarget);
  };

  const onClickAway = () => setPopperAnchorEl(null);
  const isPopperOpen = !!popperAnchorEl;

  return (
    <ClickAwayListener onClickAway={onClickAway}>
      <IconButton color="inherit" aria-label="open drawer" onClick={onThemeSelectionClick} edge="start">
        <TuneIcon />
        <Popper
          open={isPopperOpen}
          anchorEl={popperAnchorEl}
          className={classes.popper}
          placement="bottom-end"
          transition
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={250}>
              <Paper style={{ padding: theme.spacing(1) }} elevation={4}>
                <ThemeSelection />
              </Paper>
            </Fade>
          )}
        </Popper>
      </IconButton>
    </ClickAwayListener>
  );
};

export default ThemeSelectionIcon;
