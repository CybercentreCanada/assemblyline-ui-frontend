import TuneIcon from '@mui/icons-material/Tune';
import { ClickAwayListener, Fade, IconButton, Paper, Popper, Tooltip, useTheme } from '@mui/material';
import useAppConfigs from 'commons/components/app/hooks/useAppConfigs';
import ThemeSelection from 'commons/components/topnav/ThemeSelection';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const ThemeSelectionIcon = () => {
  const anchorEl = useRef();
  const { t } = useTranslation();
  const theme = useTheme();
  const { allowPersonalization, preferences } = useAppConfigs();
  const [open, setOpen] = useState<boolean>(false);
  const onThemeSelectionClick = () => setOpen(!open);
  const onClickAway = () => setOpen(false);

  return allowPersonalization || preferences.allowTranslate || preferences.allowReset ? (
    <ClickAwayListener onClickAway={onClickAway}>
      <div>
        <Tooltip title={t('theme')}>
          <IconButton
            ref={anchorEl}
            color="inherit"
            aria-label="open drawer"
            onClick={onThemeSelectionClick}
            size="large"
          >
            <TuneIcon />
          </IconButton>
        </Tooltip>
        <Popper
          sx={{ zIndex: theme.zIndex.drawer + 2, minWidth: '280px' }}
          open={open}
          anchorEl={anchorEl.current}
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
      </div>
    </ClickAwayListener>
  ) : null;
};

export default ThemeSelectionIcon;
