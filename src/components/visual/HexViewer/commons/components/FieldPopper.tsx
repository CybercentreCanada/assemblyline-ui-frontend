import { ClickAwayListener, Fade, makeStyles, Paper, Popper } from '@material-ui/core';
import clsx from 'clsx';
import { isEnter, isEscape } from 'commons/addons/elements/utils/keyboard';
import { default as React, forwardRef, useCallback, useImperativeHandle, useState } from 'react';

const useHexStyles = makeStyles(theme => ({
  button: {
    color: 'inherit',
    background: 'inherit',
    border: 'inherit',
    '&:hover': {
      background: 'inherit'
    }
  },
  paper: {
    marginTop: '16px',
    padding: theme.spacing(1),
    minWidth: '200px',
    backgroundColor: theme.palette.background.paper
  }
}));

export type FieldPopperProps = {
  paperClassName?: string;
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
  { paperClassName = null, popperPlacement = 'bottom', component = <div /> }: FieldPopperProps,
  ref
) => {
  const classes = useHexStyles();

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

  const handleClickAway = useCallback((event: React.MouseEvent<Document, MouseEvent>) => {
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
            <Paper className={clsx(classes.paper, paperClassName)} onKeyDown={handleCloseKeyDown}>
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
