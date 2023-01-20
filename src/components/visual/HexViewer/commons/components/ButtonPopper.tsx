import { ClickAwayListener, Fade, Paper, Popper } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import { isEnter, isEscape } from 'commons_deprecated/addons/elements/utils/keyboard';
import { default as React, useCallback, useState } from 'react';

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

export type ButtonPopperProps = {
  buttonClassName?: string;
  buttonComponent?: React.ReactElement;
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
  popperComponent?: React.ReactElement;
};

export const WrappedButtonPopper = ({
  buttonClassName = null,
  buttonComponent = <span />,
  paperClassName = null,
  popperPlacement = 'bottom',
  popperComponent = <input />
}: ButtonPopperProps) => {
  const classes = useHexStyles();

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
      <button className={clsx(classes.button, buttonClassName)} onClick={handleOpen}>
        {buttonComponent}
      </button>
      <Popper open={open} anchorEl={anchorEl} placement={popperPlacement} transition>
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={handleClickAway}>
            <Fade {...TransitionProps} timeout={200}>
              <Paper className={clsx(classes.paper, paperClassName)} onKeyDown={handleCloseKeyDown}>
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
