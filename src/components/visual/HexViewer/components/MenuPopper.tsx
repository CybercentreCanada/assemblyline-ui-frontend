import { ClickAwayListener, Fade, Paper, Popper, TextField } from '@material-ui/core';
import { isEnter, isEscape } from 'commons/addons/elements/utils/keyboard';
import { default as React, forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { useStyles } from '..';

export type MenuPopperProps = {
  id?: string;
  label?: string;
  placeholder?: string;
  value: number | string;
  min?: number;
  max?: number;
  onClickAway?: (event: React.MouseEvent<Document, MouseEvent>) => void;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
  onNumberChange?: (value: number) => void;
};

export const WrappedMenuPopper = (
  {
    id = '',
    label = '',
    placeholder = '',
    value = null,
    min = 0,
    max = 1,
    onClickAway = () => null,
    onChange = () => null,
    onNumberChange = () => null
  }: MenuPopperProps,
  ref
) => {
  const { toolbarClasses } = useStyles();

  const textFieldRef = useRef(null);
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

  const handleClickAway = useCallback(
    (event: React.MouseEvent<Document, MouseEvent>) => {
      setOpen(false);
      setAnchorEl(null);
      onClickAway(event);
    },
    [onClickAway]
  );

  const handleCloseKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isEscape(event.key) && !isEnter(event.key)) return;
    setOpen(false);
    setAnchorEl(null);
  }, []);

  return (
    <Popper open={open} anchorEl={anchorEl} placement="bottom" transition>
      {({ TransitionProps }) => (
        <ClickAwayListener onClickAway={handleClickAway}>
          <Fade {...TransitionProps} timeout={200}>
            <Paper className={toolbarClasses.searchPaper}>
              <TextField
                ref={textFieldRef}
                id={id}
                label={label}
                placeholder={placeholder}
                fullWidth
                size="small"
                margin="dense"
                variant="outlined"
                type="number"
                value={value}
                InputProps={{
                  autoCorrect: 'off',
                  autoCapitalize: 'off',
                  autoFocus: true,
                  inputProps: { min: min, max: max }
                }}
                onChange={onChange}
                onInput={(event: any) => {
                  onNumberChange(event.target.valueAsNumber);
                }}
                onKeyDown={event => handleCloseKeyDown(event)}
                style={{ margin: 0 }}
              />
            </Paper>
          </Fade>
        </ClickAwayListener>
      )}
    </Popper>
  );
};

export const MenuPopper = React.memo(forwardRef(WrappedMenuPopper));

export default MenuPopper;
