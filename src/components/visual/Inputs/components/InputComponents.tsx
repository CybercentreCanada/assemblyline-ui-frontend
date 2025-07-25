import type { TextFieldProps } from '@mui/material';
import {
  Badge,
  Button,
  FormControl,
  FormControlLabel,
  InputAdornment,
  InputLabel,
  Skeleton,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import { PasswordInput } from 'components/visual/Inputs/components/PasswordInput';
import { ResetInput } from 'components/visual/Inputs/components/ResetInput';
import type { InputProps } from 'components/visual/Inputs/models/Input';
import { Tooltip } from 'components/visual/Tooltip';
import type { ReactNode } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

type Props<T, P> = {
  props: Omit<InputProps<T>, 'onFocus' | 'onBlur' | 'onChange' | 'onError' | 'onExpand'>;
  state: ReturnType<typeof useInputState<T, P>>;
  children?: ReactNode;
};

export const getAriaLabel = <T,>({ id = null, label = null }: InputProps<T>) =>
  (id || (label ?? '\u00A0')).replaceAll(' ', '-');

export const getAriaDescribedBy = <T,>({
  disabled = false,
  error = () => '',
  helperText = null,
  id = null,
  label = null,
  value
}: InputProps<T>) =>
  disabled || !(error(value) || helperText) ? null : (id || (label ?? '\u00A0')).replaceAll(' ', '-');

export const usePreventPassword = <T,>({
  disabled = false,
  loading = false,
  password = false,
  readOnly = false
}: InputProps<T>) =>
  useMemo(() => loading || disabled || readOnly || !password, [disabled, loading, password, readOnly]);

export const usePreventReset = <T,>({
  disabled = false,
  loading = false,
  readOnly = false,
  reset = false
}: InputProps<T>) => useMemo(() => loading || disabled || readOnly || !reset, [disabled, loading, readOnly, reset]);

export const usePreventExpand = <T,>({ expand = null }: InputProps<T>) => useMemo(() => expand === null, [expand]);

export const isValidValue = (value: unknown): boolean =>
  value !== null && value !== undefined && value !== '' && (typeof value !== 'number' || !isNaN(value));

export const isValidNumber = (value: number, { min = null, max = null }: { min?: number; max?: number }): boolean =>
  !isNaN(value) && (min === null || value >= min) && (max === null || value <= max);

export const useInputState = <T, P = string>(
  {
    disabled,
    id: idProp = null,
    label: labelProp = null,
    expand = null,
    helperText = null,
    loading = false,
    password = false,
    readOnly = false,
    reset = false,
    value,
    onBlur = () => null,
    onChange = () => null,
    onError = () => null,
    onFocus = () => null
  }: InputProps<T>,

  validator: (value: T) => string = () => null,
  encoder: (value: T) => P = v => v as unknown as P,
  decoder: (value: P) => T = v => v as unknown as T
) => {
  const [inputValue, setInputValue] = useState<P>(encoder(value));
  const [focused, setFocused] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(true);

  const label = useMemo<string>(() => labelProp ?? '\u00A0', [labelProp]);
  const id = useMemo<string>(() => (idProp || label).replaceAll(' ', '-'), [idProp, label]);
  const error = useMemo<string>(() => validator(value), [validator, value]);
  const ariaDescribeBy = useMemo<string>(
    () => (disabled || !(error || helperText) ? null : (id || (label ?? '\u00A0')).replaceAll(' ', '-')),
    [disabled, error, helperText, id, label]
  );

  const preventExpandRender = useMemo<boolean>(() => expand === null, [expand]);
  const preventPasswordRender = useMemo<boolean>(
    () => loading || disabled || readOnly || !password,
    [disabled, loading, password, readOnly]
  );
  const preventResetRender = useMemo<boolean>(
    () => loading || disabled || readOnly || !reset,
    [disabled, loading, readOnly, reset]
  );

  const togglePassword = useCallback((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    event.stopPropagation();
    setShowPassword(p => !p);
  }, []);

  const handleChange = useCallback(
    (value: P = null) => {
      setInputValue(value);
      const parsedValue = decoder(value);
      const err = validator(parsedValue);
      if (!err) onChange(event, parsedValue);
    },
    [decoder, onChange, validator]
  );

  const handleFocus = useCallback(
    (event: React.SyntheticEvent) => {
      setFocused(!readOnly && !disabled && document.activeElement === event.target);
      onFocus(event);
      setInputValue(encoder(value));
    },
    [disabled, encoder, onFocus, readOnly, value]
  );

  const handleBlur = useCallback(
    (event: React.SyntheticEvent) => {
      setFocused(false);
      onBlur(event);
      setInputValue(encoder(value));
    },
    [encoder, onBlur, value]
  );

  useEffect(() => {
    onError(error);
  }, [error, onError]);

  return {
    ariaDescribeBy,
    error,
    focused,
    id,
    inputValue,
    label,
    preventExpandRender,
    preventPasswordRender,
    preventResetRender,
    showPassword,
    setInputValue,
    handleChange,
    handleFocus,
    handleBlur,
    togglePassword
  };
};

export const StyledEndAdornmentBox = <T, P>({ children, state }: Props<T, P>) => {
  const theme = useTheme();

  return state.preventResetRender && state.preventPasswordRender && state.preventExpandRender ? null : (
    <div
      style={{
        position: 'absolute',
        right: theme.spacing(0.75),
        top: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center'
      }}
    >
      {children}
    </div>
  );
};

export const StyledEndAdornment = <T, P>({ children, state }: Props<T, P>) => {
  return state.preventResetRender && state.preventPasswordRender && state.preventExpandRender ? null : (
    <InputAdornment position="end">{children}</InputAdornment>
  );
};

export const StyledCircularSkeleton = () => (
  <div style={{ minWidth: '40px', display: 'flex', justifyContent: 'center' }}>
    <Skeleton variant="circular" sx={{ height: '24px', width: '24px' }} />
  </div>
);

export const StyledInputSkeleton = <T, P>({ props }: Props<T, P>) => (
  <Skeleton sx={{ height: '40px', transform: 'unset', ...(props?.tiny && { height: '28px' }) }} />
);

export const StyledFormControl = <T, P>({ children, props }: Props<T, P>) => {
  const theme = useTheme();

  const { readOnly = false, disabled = false } = props;

  return (
    <FormControl
      component="form"
      size="small"
      fullWidth
      {...(readOnly && !disabled && { focused: null })}
      sx={{
        ...(props?.divider && { borderBottom: `1px solid ${theme.palette.divider}` }),
        ...(readOnly &&
          !disabled && {
            '& .MuiInputBase-input': { cursor: 'default' },
            '& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)'
            }
          })
      }}
    >
      {children}
    </FormControl>
  );
};

export const StyledButtonLabel = <T, P>({ props, state }: Props<T, P>) => {
  const theme = useTheme();

  const { focused, showPassword } = state;

  const {
    disabled = false,
    endAdornment = null,
    error = () => '',
    label = '\u00A0',
    labelProps = null,
    loading = false,
    monospace = false,
    password = false,
    preventDisabledColor = false,
    showOverflow = false,
    value
  } = props;

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: theme.spacing(1)
      }}
    >
      <Typography
        color={
          !preventDisabledColor && (loading || disabled)
            ? 'textDisabled'
            : error(value)
              ? 'error'
              : focused
                ? 'primary'
                : 'textPrimary'
        }
        variant="body2"
        {...labelProps}
        sx={{
          ...labelProps?.sx,
          marginLeft: theme.spacing(1),
          textAlign: 'start',
          width: '100%',
          ...(!showOverflow && { textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }),
          ...(monospace && { fontFamily: 'monospace' }),
          ...(password &&
            showPassword && {
              fontFamily: 'password',
              WebkitTextSecurity: 'disc',
              MozTextSecurity: 'disc',
              textSecurity: 'disc'
            })
        }}
      >
        {label}
      </Typography>
      {endAdornment}
    </div>
  );
};

export const StyledFormControlLabel = <T, P>({ props, children = null, state }: Props<T, P>) => {
  const { preventExpandRender, preventPasswordRender, preventResetRender } = state;
  const { disabled = false, loading = false, readOnly = false, showOverflow = false, tiny = false, value } = props;

  return (
    <FormControlLabel
      control={loading ? <StyledCircularSkeleton /> : (children as React.ReactElement)}
      disabled={loading || disabled || readOnly}
      label={<StyledButtonLabel props={props} state={state} />}
      slotProps={{ typography: { width: '100%' } }}
      value={value}
      sx={{
        marginLeft: 0,
        marginRight: 0,
        paddingRight: `calc(44px + ${[preventExpandRender, preventPasswordRender, preventResetRender].filter(value => value === false).length} * ${tiny ? '24px' : '28px'})`,
        ...(!showOverflow && { textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' })
      }}
    />
  );
};

export const StyledFormButton = ({ props, state, children = null }: Props<boolean, boolean>) => {
  const { handleChange, handleFocus, handleBlur } = state;
  const {
    disabled = false,
    loading = false,
    preventDisabledColor = false,
    readOnly = false,
    tiny = false,
    value = false
  } = props;

  return (
    <Button
      color="inherit"
      disabled={loading || disabled || readOnly}
      fullWidth
      size="small"
      onClick={event => {
        event.stopPropagation();
        event.preventDefault();
        handleChange(!value);
      }}
      onFocus={handleFocus}
      onBlur={handleBlur}
      sx={{
        justifyContent: 'start',
        color: 'inherit',
        textTransform: 'none',
        minHeight: tiny ? '32px' : '40px',
        ...((preventDisabledColor || readOnly) && { color: 'inherit !important' })
      }}
    >
      {children}
    </Button>
  );
};

export const StyledFormLabel = <T, P>({ props, state }: Props<T, P>) => {
  const theme = useTheme();

  const { id, focused } = state;

  const {
    disabled,
    error = () => '',
    label = null,
    labelProps,
    preventDisabledColor = false,
    required = false,
    tooltip = null,
    tooltipProps = null,
    value
  } = props;

  return (
    <Tooltip title={tooltip} {...tooltipProps}>
      <Badge color="error" variant="dot" invisible={!required || !['', undefined, null].includes(value as string)}>
        <Typography
          color={!disabled && error(value) ? 'error' : focused ? 'primary' : 'textSecondary'}
          component={InputLabel}
          gutterBottom
          htmlFor={id}
          variant="body2"
          whiteSpace="nowrap"
          {...labelProps}
          sx={{
            ...labelProps?.sx,
            ...(disabled &&
              !preventDisabledColor && {
                WebkitTextFillColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.38)'
              })
          }}
        >
          {label}
        </Typography>
      </Badge>
    </Tooltip>
  );
};

export type StyledTextField<T, P> = TextFieldProps & {
  props: Omit<InputProps<T>, 'onFocus' | 'onBlur' | 'onChange' | 'onError' | 'onExpand'>;
  state: ReturnType<typeof useInputState<T, P>>;
};

export const StyledTextField = <T,>({ props, state, ...textFieldProps }: StyledTextField<T, string>) => {
  const theme = useTheme();

  const { id, error, inputValue, showPassword, handleChange, handleFocus, handleBlur } = state;

  const {
    disabled,
    monospace = false,
    password = false,
    placeholder = null,
    readOnly = false,
    startAdornment = null,
    endAdornment = null,
    tiny = false
  } = props;

  return (
    <TextField
      id={id}
      disabled={disabled}
      error={!!error}
      fullWidth
      margin="dense"
      size="small"
      type={password && showPassword ? 'password' : 'text'}
      value={inputValue}
      variant="outlined"
      {...(readOnly && !disabled && { focused: null })}
      {...textFieldProps}
      slotProps={{
        ...textFieldProps?.slotProps,
        input: {
          'aria-describedby': getAriaDescribedBy(props),
          placeholder: placeholder,
          readOnly: readOnly,
          startAdornment: startAdornment && <InputAdornment position="start">{startAdornment}</InputAdornment>,
          endAdornment: (
            <StyledEndAdornment props={props} state={state}>
              <PasswordInput props={props} state={state} />
              <ResetInput props={props} state={state} />
              {endAdornment}
            </StyledEndAdornment>
          ),
          ...textFieldProps?.slotProps?.input
        }
      }}
      onChange={e => handleChange(e.target.value)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      sx={{
        ...textFieldProps?.sx,
        margin: 0,
        '& .MuiInputBase-root': {
          ...(tiny && {
            paddingTop: '2px !important',
            paddingBottom: '2px !important',
            fontSize: '14px'
          }),
          ...(readOnly && !disabled && { cursor: 'default' })
        },

        '& .MuiInputBase-input': {
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          ...(readOnly && !disabled && { cursor: 'default' }),
          ...(monospace && { fontFamily: 'monospace' })
        },

        '& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline': {
          ...(readOnly &&
            !disabled && {
              borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)'
            })
        }
      }}
    />
  );
};
