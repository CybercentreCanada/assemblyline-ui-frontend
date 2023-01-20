import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import { isArrowDown, isArrowUp, isEnter } from 'commons_deprecated/addons/elements/utils/keyboard';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      // '& > fieldset': {
      //   border: 'none !important',
      //   borderWidth: '0px'
      // }
    },
    formControl: {},
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
    },
    input: {
      textAlign: 'left'
    }
  })
);

export type NumericFieldProps = {
  id?: string;
  classes?: { root?: string; formControl?: string; input?: string };
  label?: string;
  placeholder?: string;
  value?: number;
  base?: number;
  min?: number;
  max?: number;
  step?: number;
  offset?: number;
  labelWidth?: number;
  fullWidth?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
  disabledArrow?: boolean;
  margin?: 'none' | 'dense';
  range?: 'none' | 'clamp' | 'loop';
  direction?: 'normal' | 'inverse';
  allowNull?: boolean;
  options?: Array<number>;
  startAdornment?: React.ReactElement;
  endAdornment?: React.ReactElement;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | any>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement | any>) => void;
  onFocus?: (event: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement | any>) => void;
  onBlur?: (event: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement | any>) => void;
  onWheel?: (event: React.WheelEvent<HTMLTextAreaElement | HTMLInputElement | HTMLDivElement | any>) => void;
  onClick?: (event: React.WheelEvent<HTMLTextAreaElement | HTMLInputElement | HTMLDivElement | any>) => void;
  onSubmit?: (event: React.FormEvent<HTMLDivElement>) => void;

  preventEnterKeyDown?: boolean;
  preventArrowKeyDown?: boolean;
  preventWheel?: boolean;
  preventClick?: boolean;
  preventSubmit?: boolean;
  inputRef?: React.MutableRefObject<any>;
};

export const WrappedNumericField = ({
  id = '',
  classes = { root: null, formControl: null, input: null },
  label = '',
  placeholder = '',
  value = null,
  base = 10,
  step = 1,
  offset = 0,
  min = Number.NEGATIVE_INFINITY,
  max = Number.POSITIVE_INFINITY,
  labelWidth = 0,
  fullWidth = false,
  autoFocus = false,
  disabled = false,
  disabledArrow = false,
  margin = 'none',
  range = 'none',
  direction = 'normal',
  allowNull = false,
  options = null,
  startAdornment = <></>,
  endAdornment = <></>,
  onChange = () => null,
  onKeyDown = () => null,
  onFocus = () => null,
  onBlur = () => null,
  onWheel = () => null,
  onClick = () => null,
  onSubmit = () => null,
  preventEnterKeyDown = false,
  preventArrowKeyDown = false,
  preventWheel = false,
  preventClick = false,
  preventSubmit = false,
  inputRef = { current: null }
}: NumericFieldProps) => {
  const fieldClasses = useStyles();

  const [textValue, setTextValue] = useState<string>('');

  const loaded = useRef<boolean>(false);
  const _inputRef = useRef<any>(null);
  const inputValue = useRef<number>(value);
  const baseValue = useRef<number>(base);
  const stepValue = useRef<number>(step);
  const offsetValue = useRef<number>(offset);
  const minValue = useRef<number>(min);
  const maxValue = useRef<number>(max);
  const optionValues = useRef<number[]>(options);
  const focusOnClick = useRef<boolean>(false);

  const clamp = useCallback((_value: number, _min: number, _max: number) => Math.min(Math.max(_value, _min), _max), []);
  const mod = useCallback((_value: number, n: number) => ((_value % n) + n) % n, []);
  const loop = useCallback(
    (_value: number, _min: number, _max: number) => mod(_value - _min, _max - _min + 1) + _min,
    [mod]
  );

  // const baseValue = useMemo<number>(() => clamp(base, 2, 36), [base, clamp]);
  // const stepValue = useMemo<number>(() => clamp(step, 1, Number.POSITIVE_INFINITY), [clamp, step]);
  // const textValue = useMemo<string>(
  //   () => (value === null || isNaN(value) ? '' : (value + offset).toString(baseValue.current).toUpperCase()),
  //   [baseValue, offset, value]
  // );

  useLayoutEffect(() => {
    (loaded.current || autoFocus) && _inputRef.current?.focus();
    loaded.current = true;
  }, [autoFocus, _inputRef]);

  useLayoutEffect(() => {
    focusOnClick.current && _inputRef.current?.focus();
    focusOnClick.current = false;
  }, [_inputRef, value]);

  useEffect(() => {
    inputValue.current = value;
  }, [value]);

  useEffect(() => {
    baseValue.current = clamp(base, 2, 36);
  }, [base, clamp]);

  useEffect(() => {
    stepValue.current = clamp(step, 1, Number.POSITIVE_INFINITY);
  }, [clamp, step]);

  useEffect(() => {
    offsetValue.current = Math.floor(offset);
  }, [offset]);

  useEffect(() => {
    minValue.current = Math.floor(min);
  }, [min]);

  useEffect(() => {
    maxValue.current = Math.floor(max);
  }, [max]);

  useEffect(() => {
    optionValues.current = options === null ? null : [...options];
  }, [options]);

  useEffect(() => {
    setTextValue(
      value === null || isNaN(value) ? '' : (value + offsetValue.current).toString(baseValue.current).toUpperCase()
    );
  }, [value]);

  const rangeSelector = useCallback(
    (_value: number) => {
      if (range === 'clamp') return clamp(_value, minValue.current, maxValue.current);
      else if (range === 'loop') return loop(_value, minValue.current, maxValue.current);
      else return _value;
    },
    [clamp, loop, range]
  );

  const directionSelector = useCallback(
    (_step: number) => {
      if (direction === 'normal') return _step;
      else if (direction === 'inverse') return -_step;
    },
    [direction]
  );

  const nullSelector = useCallback(
    (_value: number) => {
      if (allowNull && isNaN(_value)) return null;
      else if (!allowNull && isNaN(_value)) return value;
      else return _value;
    },
    [allowNull, value]
  );

  const optionSelector = useCallback(
    (_value: number, _step: number) => {
      if (optionValues.current === null || optionValues.current.length === 0) return _value + _step;
      else if (isNaN(_value)) return Math.min(...optionValues.current);
      else {
        return optionValues.current[
          mod(
            _step +
              optionValues.current.findIndex(
                option =>
                  option ===
                  optionValues.current.reduce((prev, next) => {
                    return Math.abs(next - _value) < Math.abs(prev - _value) ? next : prev;
                  })
              ),
            optionValues.current.length
          )
        ];
      }
    },
    [mod]
  );

  const handleChange = useCallback(
    (_value: number, _step: number) => (event: any) => {
      const newValue = nullSelector(rangeSelector(optionSelector(_value, directionSelector(_step))));
      inputValue.current = newValue;
      setTextValue(
        newValue === null || isNaN(newValue)
          ? ''
          : (newValue + offsetValue.current).toString(baseValue.current).toUpperCase()
      );
      onChange({
        ...event,
        target: {
          ...event.target,
          value: newValue !== null ? newValue.toString(baseValue.current).toUpperCase() : '',
          valueAsNumber: newValue
        }
      });
    },
    [directionSelector, nullSelector, onChange, optionSelector, rangeSelector]
  );

  const focus = useCallback(
    (event: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement | HTMLDivElement | any>) => {
      onFocus(event);
    },
    [onFocus]
  );

  const blur = useCallback(
    (event: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement | HTMLDivElement | any>) => {
      handleChange(parseInt(textValue, baseValue.current) - offsetValue.current, 0)(event);
      onBlur(event);
    },
    [handleChange, onBlur, textValue]
  );

  const inputChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLDivElement | any>) =>
      setTextValue(event.target.value),
    // handleValueChange(parseInt(event.target.value, baseValue) - offset, 0)(event),
    []
  );

  const wheel = useCallback(
    (event: React.WheelEvent<HTMLTextAreaElement | HTMLInputElement | HTMLDivElement | any>) => {
      if (preventWheel) return;
      // event.preventDefault();
      handleChange(inputValue.current, event.deltaY > 0 ? -stepValue.current : stepValue.current)(event);
      onWheel(event);
    },
    [handleChange, onWheel, preventWheel]
  );

  const keyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement | any>) => {
      const { key: keyCode } = event;
      // onKeyDown(event);
      // if (!isArrowUp(keyCode) && !isArrowDown(keyCode) && !isEnter(keyCode)) return;
      // event.preventDefault();

      if (!preventEnterKeyDown && isEnter(keyCode))
        handleChange(parseInt(textValue, baseValue.current) - offsetValue.current, 0)(event);
      else if (!preventArrowKeyDown && isArrowUp(keyCode)) handleChange(inputValue.current, stepValue.current)(event);
      else if (!preventArrowKeyDown && isArrowDown(keyCode))
        handleChange(inputValue.current, -stepValue.current)(event);

      onKeyDown(event);
    },
    [handleChange, onKeyDown, preventArrowKeyDown, preventEnterKeyDown, textValue]
  );

  const click = useCallback(
    (_dir: 'up' | 'down') =>
      (event: React.WheelEvent<HTMLTextAreaElement | HTMLInputElement | HTMLDivElement | any>) => {
        focusOnClick.current = true;
        if (!preventClick && _dir === 'up') handleChange(inputValue.current, stepValue.current)(event);
        else if (!preventClick && _dir === 'down') handleChange(inputValue.current, -stepValue.current)(event);

        onClick(event);
        event.preventDefault();
      },
    [handleChange, onClick, preventClick]
  );

  const submit = useCallback(
    (event: React.FormEvent<HTMLDivElement>) => {
      if (preventSubmit) event.preventDefault();
      onSubmit(event);
    },
    [onSubmit, preventSubmit]
  );

  return (
    <FormControl
      fullWidth={fullWidth}
      className={clsx(fieldClasses.formControl, classes.formControl)}
      variant="outlined"
      size="small"
    >
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <OutlinedInput
        className={fieldClasses.outlinedInput}
        classes={{
          root: clsx(fieldClasses.root, classes.root),
          input: clsx(fieldClasses.input, classes.input)
        }}
        id={id}
        type="text"
        placeholder={placeholder}
        fullWidth={fullWidth}
        margin={margin}
        disabled={disabled}
        value={textValue}
        onFocus={focus}
        onBlur={blur}
        onChange={inputChange}
        onWheel={wheel}
        onKeyDown={keyDown}
        onSubmit={submit}
        inputRef={inputEl => {
          _inputRef.current = inputEl;
          inputRef.current = inputEl;
        }}
        startAdornment={startAdornment}
        endAdornment={
          <InputAdornment position="end" onClick={() => _inputRef.current?.focus()}>
            {endAdornment}
            <div className={fieldClasses.buttonGroup}>
              <IconButton
                className={fieldClasses.iconButton}
                onClick={click('up')}
                edge="end"
                size="small"
                disabled={disabledArrow}
              >
                <ArrowDropUpIcon fontSize="small" />
              </IconButton>
              <IconButton
                className={fieldClasses.iconButton}
                onClick={click('down')}
                edge="end"
                size="small"
                disabled={disabledArrow}
              >
                <ArrowDropDownIcon fontSize="small" />
              </IconButton>
            </div>
          </InputAdornment>
        }
        label={<InputLabel sx={{ width: labelWidth }} />}
      />
    </FormControl>
  );
};

export const NumericField = React.memo(WrappedNumericField);

export default NumericField;
