import FormControl from '@material-ui/core/FormControl';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputLabel from '@material-ui/core/InputLabel';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import { isArrowDown, isArrowUp, isEscape } from 'commons/addons/elements/utils/keyboard';
import React, { useCallback, useLayoutEffect, useMemo, useRef } from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      width: '100%'
    },
    outlinedInput: {
      paddingRight: '4px'
    },
    buttonGroup: {
      display: 'flex',
      flexDirection: 'column'
    },
    iconButton: {
      height: '20px',
      borderRadius: 0,
      minWidth: '20px'
    }
  })
);

export type NumericFieldProps = {
  id?: string;
  label?: string;
  placeholder?: string;
  value?: number;
  base?: number;
  min?: number;
  max?: number;
  step?: number;
  labelWidth?: number;
  fullWidth?: boolean;
  autoFocus?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | any>) => void;
};

export const WrappedNumericField = ({
  id = '',
  label = '',
  placeholder = '',
  value = null,
  base = 10,
  min = -Infinity,
  max = Infinity,
  step = 1,
  labelWidth = 0,
  fullWidth = false,
  autoFocus = false,
  onChange = () => null
}: NumericFieldProps) => {
  const classes = useStyles();

  const loaded = useRef<boolean>(false);
  const inputRef = useRef<any>(null);

  const clamp = useCallback((_value: number, _min: number, _max: number) => Math.min(Math.max(_value, _min), _max), []);

  const baseValue = useMemo<number>(() => clamp(base, 2, 36), [base, clamp]);
  const stepValue = useMemo<number>(() => clamp(step, 1, Infinity), [clamp, step]);
  const textValue = useMemo<string>(
    () => (value === null || isNaN(value) ? '' : value.toString(baseValue).toUpperCase()),
    [baseValue, value]
  );

  useLayoutEffect(() => {
    (loaded.current || autoFocus) && inputRef.current?.focus();
    loaded.current = true;
  }, [autoFocus, inputRef, value]);

  const handleValueChange = useCallback(
    (_value: number) => (event: any) => {
      const newValue = clamp(_value, min, max);
      onChange({
        ...event,
        target: {
          ...event.target,
          value: newValue.toString(baseValue).toUpperCase(),
          valueAsNumber: newValue
        }
      });
    },
    [baseValue, clamp, max, min, onChange]
  );

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLDivElement | any>) =>
      handleValueChange(parseInt(event.target.value, baseValue))(event),
    [baseValue, handleValueChange]
  );

  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLTextAreaElement | HTMLInputElement | HTMLDivElement | any>) =>
      handleValueChange(event.deltaY > 0 ? value - stepValue : value + stepValue)(event),
    [handleValueChange, stepValue, value]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement | any>) => {
      const { key: keyCode } = event;
      if (!isArrowUp(keyCode) && !isArrowDown(keyCode) && !isEscape(keyCode)) return;
      event.preventDefault();
      if (isEscape(keyCode)) inputRef.current?.blur();
      else if (isArrowUp(keyCode)) handleValueChange(value + stepValue)(event);
      else if (isArrowDown(keyCode)) handleValueChange(value - stepValue)(event);
    },
    [handleValueChange, inputRef, stepValue, value]
  );

  const handleClick = useCallback(
    (direction: 'up' | 'down') =>
      (event: React.WheelEvent<HTMLTextAreaElement | HTMLInputElement | HTMLDivElement | any>) => {
        event.preventDefault();
        if (direction === 'up') handleValueChange(value + stepValue)(event);
        else if (direction === 'down') handleValueChange(value - stepValue)(event);
      },
    [handleValueChange, stepValue, value]
  );

  return (
    <FormControl fullWidth={fullWidth} className={classes.formControl} variant="outlined" size="small">
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <OutlinedInput
        className={classes.outlinedInput}
        id={id}
        type="text"
        placeholder={placeholder}
        fullWidth={fullWidth}
        value={textValue}
        onChange={handleChange}
        onWheel={handleWheel}
        onKeyDown={handleKeyDown}
        inputRef={inputEl => (inputRef.current = inputEl)}
        endAdornment={
          <InputAdornment position="end">
            <div className={classes.buttonGroup}>
              <IconButton className={classes.iconButton} onClick={handleClick('up')} edge="end" size="small">
                <ArrowDropUpIcon fontSize="small" />
              </IconButton>
              <IconButton className={classes.iconButton} onClick={handleClick('down')} edge="end" size="small">
                <ArrowDropDownIcon fontSize="small" />
              </IconButton>
            </div>
          </InputAdornment>
        }
        labelWidth={labelWidth}
      />
    </FormControl>
  );
};

export const NumericField = React.memo(WrappedNumericField);
export default NumericField;
