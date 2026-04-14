import { Tune } from '@mui/icons-material';
import { ClickAwayListener, Fade, IconButton, Paper, Popper, useTheme } from '@mui/material';
import { useCallback, useState, type MouseEvent } from 'react';
import { useAppPreferences } from '../../app/hooks/useAppPreferences';
import ThemeSelection from '../../topnav/theme/ThemeSelection';

const ThemeSelectionIcon = () => {
  const theme = useTheme();

  const { allowPersonalization, allowTranslate, allowReset } = useAppPreferences();

  const [open, setOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const onClickAway = useCallback(() => setOpen(false), []);

  const onThemeSelectionClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    setOpen(_open => !_open);
    setAnchorEl(event.currentTarget);
  }, []);

  return allowPersonalization || allowTranslate || allowReset ? (
    <ClickAwayListener onClickAway={onClickAway} mouseEvent="onMouseUp">
      <IconButton color="inherit" aria-label="open drawer" onClick={onThemeSelectionClick} size="large">
        <Tune />
        <Popper
          sx={{ zIndex: theme.zIndex.drawer + 2, minWidth: '280px' }}
          open={open && anchorEl !== null}
          anchorEl={anchorEl}
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
