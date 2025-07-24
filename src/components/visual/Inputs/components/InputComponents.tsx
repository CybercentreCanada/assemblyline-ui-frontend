import type { TextFieldProps } from '@mui/material';
import {
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
import type { InputProps } from 'components/visual/Inputs/models/Input';
import { Tooltip } from 'components/visual/Tooltip';
import type { ReactNode } from 'react';
import React, { useMemo } from 'react';

type Props<T> = {
  props: Omit<InputProps<T>, 'onFocus' | 'onBlur' | 'onChange' | 'onError' | 'onExpand'>;
  children?: ReactNode;
  focused?: boolean;
  showPassword?: boolean;

  onFocus?: InputProps<T>['onFocus'];
  onBlur?: InputProps<T>['onBlur'];
  onChange?: InputProps<T>['onChange'];
  onError?: InputProps<T>['onError'];
  onExpand?: InputProps<T>['onExpand'];
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

export const StyledEndAdornmentBox = <T,>({ children, props }: Props<T>) => {
  const theme = useTheme();

  const preventExpandRender = usePreventExpand(props);
  const preventPasswordRender = usePreventPassword(props);
  const preventResetRender = usePreventReset(props);

  return preventResetRender && preventPasswordRender && preventExpandRender ? null : (
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

export const StyledCircularSkeleton = () => (
  <div style={{ minWidth: '40px', display: 'flex', justifyContent: 'center' }}>
    <Skeleton variant="circular" sx={{ height: '24px', width: '24px' }} />
  </div>
);

export const StyledInputSkeleton = <T,>({ props }: Props<T>) => (
  <Skeleton sx={{ height: '40px', transform: 'unset', ...(props?.tiny && { height: '28px' }) }} />
);

export const StyledFormControl = <T,>({ children, props }: Props<T>) => {
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

export const StyledButtonLabel = <T,>({ props, focused = false, showPassword = false }: Props<T>) => {
  const theme = useTheme();

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

export const StyledFormControlLabel = <T,>({
  props,
  children = null,
  focused = false,
  showPassword = false
}: Props<T>) => {
  const { disabled = false, loading = false, readOnly = false, showOverflow = false, tiny = false, value } = props;

  const preventExpandRender = usePreventExpand(props);
  const preventPasswordRender = usePreventPassword(props);
  const preventResetRender = usePreventReset(props);

  return (
    <FormControlLabel
      control={loading ? <StyledCircularSkeleton /> : (children as React.ReactElement)}
      disabled={loading || disabled || readOnly}
      label={<StyledButtonLabel props={props} focused={focused} showPassword={showPassword} />}
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

export const StyledFormButton = <T,>({
  props,
  children = null,
  onBlur = () => null,
  onChange = () => null,
  onFocus = () => null
}: Props<T>) => {
  const { disabled = false, loading = false, preventDisabledColor = false, readOnly = false, tiny = false } = props;

  return (
    <Button
      color="inherit"
      disabled={loading || disabled || readOnly}
      fullWidth
      size="small"
      onClick={event => {
        event.stopPropagation();
        event.preventDefault();
        onChange(event, null);
      }}
      onFocus={onFocus}
      onBlur={onBlur}
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

export const StyledFormLabel = <T,>({ props, focused = false }: Props<T>) => {
  const theme = useTheme();

  const {
    disabled,
    error = () => '',
    label = null,
    labelProps,
    preventDisabledColor = false,
    tooltip = null,
    tooltipProps = null,
    value
  } = props;

  return (
    <Tooltip title={tooltip} {...tooltipProps}>
      <Typography
        color={!disabled && error(value) ? 'error' : focused ? 'primary' : 'textSecondary'}
        component={InputLabel}
        gutterBottom
        htmlFor={getAriaLabel(props)}
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
    </Tooltip>
  );
};

export type StyledTextField<T> = TextFieldProps & {
  props: Omit<InputProps<T>, 'onFocus' | 'onBlur' | 'onChange' | 'onError' | 'onExpand'>;
  showPassword?: boolean;
};

export const StyledTextField = <T,>({ props, showPassword = false, ...textFieldProps }: StyledTextField<T>) => {
  const theme = useTheme();

  const {
    disabled,
    error = () => '',
    monospace = false,
    password = false,
    placeholder = null,
    readOnly = false,
    startAdornment = null,
    tiny = false,
    value
  } = props;

  const errorValue = useMemo<string>(() => error(value), [error, value]);

  return (
    <TextField
      id={getAriaLabel(props)}
      disabled={disabled}
      error={!!errorValue}
      fullWidth
      margin="dense"
      size="small"
      type={password && showPassword ? 'password' : 'text'}
      variant="outlined"
      {...(readOnly && !disabled && { focused: null })}
      {...textFieldProps}
      slotProps={{
        ...textFieldProps?.slotProps,
        input: {
          ...textFieldProps?.slotProps?.input,
          'aria-describedby': getAriaDescribedBy(props),
          placeholder: placeholder,
          readOnly: readOnly,
          startAdornment: startAdornment && <InputAdornment position="start">{startAdornment}</InputAdornment>
        }
      }}
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
