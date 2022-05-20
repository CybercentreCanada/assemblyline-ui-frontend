import FormControl from '@material-ui/core/FormControl';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import React from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& > fieldset': {
        border: 'none !important',
        borderWidth: '0px'
      }
    },
    formControl: {
      width: '100%'
    },
    outlinedInput: {
      paddingRight: '4px'
    },
    input: {
      textAlign: 'left'
    }
  })
);

export type DelayedTextFieldProps = {
  id?: string;
  label?: string;
  classes?: {
    formControl?: string;
    outlinedInput?: string;
    root?: string;
    input?: string;
  };
  placeholder?: string;
  value?: string;
  delay?: number;
  type?:
    | 'button'
    | 'checkbox'
    | 'color'
    | 'date'
    | 'datetime-local'
    | 'email'
    | 'file'
    | 'hidden'
    | 'image'
    | 'month'
    | 'number'
    | 'password'
    | 'radio'
    | 'range'
    | 'reset'
    | 'search'
    | 'submit'
    | 'tel'
    | 'text'
    | 'time'
    | 'url'
    | 'week';
  margin?: 'none' | 'dense';
  fullWidth?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  maxRows?: number;

  onFocus?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onWheel?: React.WheelEventHandler<HTMLDivElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
};

export const WrappedDelayedTextField = ({
  id = '',
  label = '',

  classes = {
    formControl: null,
    outlinedInput: null,
    root: null,
    input: null
  },

  value = '',
  placeholder = '',
  delay = 1000,

  type = 'text',
  margin = 'dense',
  fullWidth = true,
  autoFocus = true,
  disabled = false,
  multiline = false,
  maxRows = null,

  onFocus = () => null,
  onBlur = () => null,
  onWheel = () => null,
  onKeyDown = () => null,
  onChange = () => null
}: DelayedTextFieldProps) => {
  const c = useStyles();

  const [_value, setValue] = React.useState<string>(value);

  const inputRef = React.useRef(null);

  const valueRef = React.useRef<string>(value);
  const delayRef = React.useRef<number>(delay);
  const timerRef = React.useRef(null);
  const onChangeRef = React.useRef<(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void>(null);
  const onChangeEventRef = React.useRef(null);

  React.useEffect(() => {
    valueRef.current = value;
  }, [value]);

  React.useEffect(() => {
    delayRef.current = delay;
  }, [delay]);

  React.useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  React.useEffect(() => {
    setValue(_val => (_val !== value ? value : _val));
  }, [value]);

  React.useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (onChangeEventRef.current !== null) onChangeRef.current(onChangeEventRef.current);
    }, delayRef.current);
  }, [_value]);

  return (
    <FormControl className={clsx(c.formControl, classes.formControl)} variant="outlined" size="small">
      <OutlinedInput
        id={id}
        label={label}
        className={clsx(c.outlinedInput, classes.outlinedInput)}
        classes={{
          root: clsx(c.root, classes.root),
          input: clsx(c.input, classes.input)
        }}
        inputRef={inputRef}
        type={type}
        placeholder={placeholder}
        fullWidth={fullWidth}
        autoFocus={autoFocus}
        margin={margin}
        disabled={disabled}
        multiline={multiline}
        maxRows={maxRows}
        value={_value}
        onFocus={onFocus}
        onBlur={onBlur}
        onWheel={onWheel}
        onKeyDown={(event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          onKeyDown(event);
        }}
        onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
          onChangeEventRef.current = event;
          valueRef.current = event.target.value;
          setValue(event.target.value);
        }}
      />
    </FormControl>
  );
};

export const DelayedTextField = React.memo(WrappedDelayedTextField);
export default DelayedTextField;
