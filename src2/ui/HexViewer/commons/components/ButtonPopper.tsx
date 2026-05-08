import type { ButtonProps, PaperProps } from '@mui/material';
import { Button, ClickAwayListener, Fade, Paper, Popper, useTheme } from '@mui/material';
import { isEnter, isEscape } from 'commons/components/utils/keyboard';
import { default as React, useCallback, useState } from 'react';

export type ButtonPopperProps = {
  buttonProps?: ButtonProps;
  buttonComponent?: React.ReactElement;
  paperProps?: PaperProps;
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

export const WrappedButtonPopper = ({
  buttonProps = null,
  buttonComponent = <span />,
  paperProps = null,
  popperPlacement = 'bottom',
  popperComponent = <input />
}: ButtonPopperProps) => {
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
      <Button
        onClick={handleOpen}
        {...buttonProps}
        sx={{
          color: 'inherit',
          background: 'inherit',
          border: 'inherit',
          '&:hover': {
            background: 'inherit'
          },
          ...buttonProps?.sx
        }}
      >
        {buttonComponent}
      </Button>
      <Popper open={open} anchorEl={anchorEl} placement={popperPlacement} transition>
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={handleClickAway}>
            <Fade {...TransitionProps} timeout={200}>
              <Paper
                onKeyDown={handleCloseKeyDown}
                {...paperProps}
                sx={{
                  marginTop: '16px',
                  padding: theme.spacing(1),
                  minWidth: '200px',
                  backgroundColor: theme.palette.background.paper,
                  ...paperProps?.sx
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

export const ButtonPopper = React.memo(WrappedButtonPopper);

export default ButtonPopper;
