import { ClickAwayListener, Fade, Popper } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import AdbIcon from '@mui/icons-material/Adb';
import clsx from 'clsx';
import { isEscape } from 'commons/addons/elements/utils/keyboard';
import { default as React, forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { TooltipIconButton } from '.';

const useHexStyles = makeStyles(theme => ({
  searchPaper: {
    marginTop: '16px',
    padding: theme.spacing(0),
    minWidth: '200px',
    backgroundColor: theme.palette.background.paper
  }
}));

export type PopperIconButtonProps = {
  id?: string;
  classes?: {
    iconButton: string;
    paper: string;
  };
  title?: string;
  icon?: React.ReactElement;
  field?: React.ReactElement;
  disabled?: boolean;
  size?: 'small' | 'medium';
  placement?:
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
};

export const WrappedPopperIconButton = (
  {
    id = '',
    classes = {
      iconButton: null,
      paper: null
    },
    title = '',
    icon = <AdbIcon />,
    field = <input />,
    disabled = false,
    size = 'small',
    placement = 'bottom'
  }: PopperIconButtonProps,
  ref: React.Ref<any>
) => {
  const c = useHexStyles();

  const [open, setOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      open: (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
        setOpen(true);
      },
      close: (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(null);
        setOpen(false);
      }
    }),
    []
  );

  const handleOpen = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  }, []);

  const handleClickAway = useCallback((event: React.MouseEvent<Document, MouseEvent>) => {
    setOpen(false);
    setAnchorEl(null);
  }, []);

  const handleCloseKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isEscape(event.key)) return;
    setOpen(false);
    setAnchorEl(null);
  }, []);

  return (
    <>
      <TooltipIconButton
        classes={{ iconButton: classes.iconButton }}
        title={title}
        icon={icon}
        disabled={disabled}
        size={size}
        onClick={handleOpen}
      />
      <Popper open={open} anchorEl={anchorEl} placement={placement} transition disablePortal={true}>
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={handleClickAway}>
            <Fade {...TransitionProps} timeout={200}>
              <div className={clsx(c.searchPaper, classes.paper)} onKeyDown={handleCloseKeyDown}>
                {field}
              </div>
            </Fade>
          </ClickAwayListener>
        )}
      </Popper>
    </>
  );
};

export const PopperIconButton = React.memo(forwardRef(WrappedPopperIconButton));

export default PopperIconButton;
