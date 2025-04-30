import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import type { SxProps } from '@mui/material/styles';
import React, { useEffect, useRef, useState } from 'react';

export type DelayedTextFieldProps = {
  id?: string;
  label?: string;
  slotSX?: {
    formControl?: SxProps;
    outlinedInput?: SxProps;
    root?: SxProps;
    input?: SxProps;
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
  size?: 'small' | 'medium';
  variant?: 'filled' | 'outlined' | 'standard';
  fullWidth?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  maxRows?: number;
  preventSubmit?: boolean;

  inputRef?: React.MutableRefObject<any>;

  onFocus?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onWheel?: React.WheelEventHandler<HTMLDivElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
  onSubmit?: (event: React.FormEvent<HTMLDivElement>) => void;
  onPaste?: (event: React.ClipboardEvent<HTMLDivElement>) => void;
};

export const WrappedDelayedTextField = ({
  id = '',
  label = '',

  slotSX = {
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
  size = 'small',
  variant = 'outlined',
  fullWidth = true,
  autoFocus = true,
  disabled = false,
  multiline = false,
  maxRows = null,
  preventSubmit = false,

  inputRef = { current: null },
  onFocus = () => null,
  onBlur = () => null,
  onWheel = () => null,
  onKeyDown = () => null,
  onChange = () => null,
  onSubmit = () => null,
  onPaste = () => null
}: DelayedTextFieldProps) => {
  const [_value, setValue] = useState<string>(value);

  const _inputRef = useRef<any>(null);
  const valueRef = useRef<string>(value);
  const delayRef = useRef<number>(delay);
  const timerRef = useRef(null);
  const onChangeRef = useRef<(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void>(null);
  const onChangeEventRef = useRef(null);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    delayRef.current = delay;
  }, [delay]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    setValue(_val => (_val !== value ? value : _val));
  }, [value]);

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (onChangeEventRef.current !== null) onChangeRef.current(onChangeEventRef.current);
    }, delayRef.current);
  }, [_value]);

  return (
    <FormControl variant={variant} size={size} sx={{ width: '100%', ...slotSX?.formControl }}>
      <OutlinedInput
        id={id}
        label={label}
        inputRef={inputEl => {
          _inputRef.current = inputEl;
          inputRef.current = inputEl;
        }}
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
        onPaste={event => {
          onPaste(event);
        }}
        onKeyDown={(event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          onKeyDown(event);
        }}
        onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
          onChangeEventRef.current = event;
          valueRef.current = event.target.value;
          setValue(event.target.value);
        }}
        onSubmit={(event: React.FormEvent<HTMLDivElement>) => {
          if (preventSubmit) event.preventDefault();
          onSubmit(event);
        }}
        sx={{
          paddingRight: '4px',
          '& .MuiOutlinedInput-notchedOutline': {
            border: 'none'
          },
          ...slotSX?.outlinedInput
        }}
        slotProps={{
          root: {
            sx: {
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none'
              },
              ...slotSX?.root
            }
          },
          input: {
            sx: {
              textAlign: 'left',
              ...slotSX?.input
            }
          }
        }}
      />
    </FormControl>
  );
};

export const DelayedTextField = React.memo(WrappedDelayedTextField);
export default DelayedTextField;
