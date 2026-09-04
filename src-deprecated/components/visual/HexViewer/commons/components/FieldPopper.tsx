import type { SxProps } from '@mui/material';
import { ClickAwayListener, Fade, Paper, Popper, useTheme } from '@mui/material';
import { isEnter, isEscape } from 'commons/components/utils/keyboard';
import { default as React, forwardRef, useCallback, useImperativeHandle, useState } from 'react';

export type FieldPopperProps = {
  paperSX?: SxProps;
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
  component?: React.ReactElement;
};

export const WrappedFieldPopper = (
  { paperSX = null, popperPlacement = 'bottom', component = <div /> }: FieldPopperProps,
  ref
) => {
  const theme = useTheme();

  const [open, setOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      open: (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
        setOpen(true);
      }
    }),
    []
  );

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
    <Popper open={open} anchorEl={anchorEl} placement={popperPlacement} transition>
      {({ TransitionProps }) => (
        <ClickAwayListener onClickAway={handleClickAway} mouseEvent="onMouseDown" touchEvent="onTouchStart">
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
              {component}
            </Paper>
          </Fade>
        </ClickAwayListener>
      )}
    </Popper>
  );
};

export const FieldPopper = React.memo(forwardRef(WrappedFieldPopper));

export default FieldPopper;
