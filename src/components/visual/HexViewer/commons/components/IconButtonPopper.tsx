import AdbIcon from '@mui/icons-material/Adb';
import type { SxProps } from '@mui/material';
import { ClickAwayListener, Fade, Paper, Popper, Tooltip, useTheme } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { isEnter, isEscape } from 'commons/components/utils/keyboard';
import { default as React, useCallback, useState } from 'react';

export type IconButtonPopperProps = {
  buttonSX?: SxProps;
  paperSX?: SxProps;
  tooltipTitle?: string;
  iconButtonSize?: 'small' | 'medium';
  icon?: React.ReactElement;
  popperPlacement?:
    | 'bottom-end'
    | 'bottom-start'
    | 'bottom'
    | 'left-end'
    | 'left-start'
    | 'left'
    | 'right-end'
    | 'right-start'
    | 'right'
    | 'top-end'
    | 'top-start'
    | 'top';
  popperComponent?: React.ReactElement;
};

export const WrappedIconButtonPopper = ({
  buttonSX = null,
  paperSX = null,
  tooltipTitle = '',
  iconButtonSize = 'small',
  icon = <AdbIcon />,
  popperPlacement = 'bottom',
  popperComponent = <input />
}: IconButtonPopperProps) => {
  const theme = useTheme();

  const [open, setOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleOpen = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  }, []);

  const handleClickAway = useCallback((event: MouseEvent | TouchEvent) => {
    setOpen(false);
    setAnchorEl(null);
  }, []);

  const handleCloseKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isEscape(event.key) && !isEnter(event.key)) return;
    setOpen(false);
    setAnchorEl(null);
  }, []);

  return (
    <>
      <Tooltip title={tooltipTitle}>
        <IconButton
          aria-label={tooltipTitle}
          onClick={handleOpen}
          size={iconButtonSize}
          sx={{
            padding: 10,
            [theme.breakpoints.only('sm')]: {
              padding: 4
            },
            [theme.breakpoints.only('xs')]: {
              padding: 2
            },
            ...buttonSX
          }}
        >
          {icon}
        </IconButton>
      </Tooltip>
      <Popper open={open} anchorEl={anchorEl} placement={popperPlacement} transition>
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={handleClickAway}>
            <Fade {...TransitionProps} timeout={200}>
              <Paper
                onKeyDown={handleCloseKeyDown}
                sx={{
                  marginTop: '16px',
                  padding: theme.spacing(1),
                  minWidth: '200px',
                  backgroundColor: theme.palette.background.paper,
                  ...paperSX
                }}
              >
                {popperComponent}
              </Paper>
            </Fade>
          </ClickAwayListener>
        )}
      </Popper>
    </>
  );
};

export const IconButtonPopper = React.memo(WrappedIconButtonPopper);

export default IconButtonPopper;
