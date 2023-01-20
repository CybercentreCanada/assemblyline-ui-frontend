import TuneIcon from '@mui/icons-material/Tune';
import { ClickAwayListener, Fade, IconButton, Paper, Popper, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useAppLayout from 'commons_deprecated/components/hooks/useAppLayout';
import ThemeSelection from 'commons_deprecated/components/layout/topnav/ThemeSelection';
import React, { useState } from 'react';

const useStyles = () =>
  makeStyles(theme => ({
    popper: {
      zIndex: theme.zIndex.drawer + 2,
      minWidth: '280px'
    }
  }))();

const ThemeSelectionIcon = () => {
  const theme = useTheme();
  const classes = useStyles();
  const [popperAnchorEl, setPopperAnchorEl] = useState(null);
  const { layoutProps } = useAppLayout();

  const onThemeSelectionClick = (event: React.MouseEvent) => {
    setPopperAnchorEl(popperAnchorEl ? null : event.currentTarget);
  };

  const onClickAway = () => setPopperAnchorEl(null);
  const isPopperOpen = !!popperAnchorEl;

  const allowPersonalization =
    layoutProps.allowAutoHideTopbar ||
    layoutProps.allowBreadcrumbs ||
    layoutProps.allowQuickSearch ||
    layoutProps.allowReset ||
    layoutProps.allowThemeSelection ||
    layoutProps.allowTopbarModeSelection;

  return allowPersonalization || layoutProps.allowTranslate || layoutProps.allowReset ? (
    <ClickAwayListener onClickAway={onClickAway}>
      <IconButton color="inherit" aria-label="open drawer" onClick={onThemeSelectionClick} size="large">
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
  ) : null;
};

export default ThemeSelectionIcon;
