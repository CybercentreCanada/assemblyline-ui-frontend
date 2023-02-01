import AdbIcon from '@mui/icons-material/Adb';
import { ClickAwayListener, Fade, Paper, Popper, Tooltip } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import { isEnter, isEscape } from 'commons/components/utils/keyboard';
import { default as React, useCallback, useState } from 'react';

const useHexStyles = makeStyles(theme => ({
  iconButton: {
    padding: 10,
    [theme.breakpoints.down('sm')]: {
      padding: 4
    },
    [theme.breakpoints.down('xs')]: {
      padding: 2
    }
  },
  paper: {
    marginTop: '16px',
    padding: theme.spacing(1),
    minWidth: '200px',
    backgroundColor: theme.palette.background.paper
  }
}));

export type IconButtonPopperProps = {
  buttonClassName?: string;
  paperClassName?: string;
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
  buttonClassName = null,
  paperClassName = null,
  tooltipTitle = '',
  iconButtonSize = 'small',
  icon = <AdbIcon />,
  popperPlacement = 'bottom',
  popperComponent = <input />
}: IconButtonPopperProps) => {
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
      <Tooltip title={tooltipTitle}>
        <IconButton
          className={clsx(classes.iconButton, buttonClassName)}
          aria-label={tooltipTitle}
          onClick={handleOpen}
          size={iconButtonSize}
        >
          {icon}
        </IconButton>
      </Tooltip>
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

export const IconButtonPopper = React.memo(WrappedIconButtonPopper);

export default IconButtonPopper;
