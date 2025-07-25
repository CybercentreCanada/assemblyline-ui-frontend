import { ExpandMore } from '@mui/icons-material';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import type { ListItemButtonProps, ListItemProps, TextFieldProps } from '@mui/material';
import {
  Badge,
  Button,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Skeleton,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import type { ComponentProps } from 'components/visual/Inputs/lib/inputs.model';
import { getAriaDescribedBy } from 'components/visual/Inputs/lib/inputs.utils';
import { Tooltip } from 'components/visual/Tooltip';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const StyledEndAdornmentBox = <T, P>({ children, state }: ComponentProps<T, P>) => {
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

export const StyledEndAdornment = <T, P>({ children, state }: ComponentProps<T, P>) => {
  return state.preventResetRender && state.preventPasswordRender && state.preventExpandRender ? null : (
    <InputAdornment position="end">{children}</InputAdornment>
  );
};

export const ExpandInput = <T, P>({ props, state }: ComponentProps<T, P>) => {
  const theme = useTheme();

  const { id, preventExpandRender } = state;
  const { expand = null, onExpand = () => null, expandProps } = props;

  return preventExpandRender ? null : (
    <ListItemIcon sx={{ minWidth: 0 }}>
      <IconButton
        aria-label={`${id}-expand`}
        type="button"
        onClick={event => {
          event.preventDefault();
          event.stopPropagation();
          onExpand(event);
        }}
        {...expandProps}
      >
        <ExpandMore
          fontSize="small"
          sx={{
            transition: theme.transitions.create('transform', {
              duration: theme.transitions.duration.shortest
            }),
            transform: 'rotate(0deg)',
            ...(expand && { transform: 'rotate(180deg)' })
          }}
        />
      </IconButton>
    </ListItemIcon>
  );
};

export const PasswordInput = <T, P>({ props, state }: ComponentProps<T, P>) => {
  const theme = useTheme();

  const { id, preventPasswordRender, showPassword, togglePassword } = state;
  const { resetProps, tiny = false } = props;

  return preventPasswordRender ? null : (
    <IconButton
      aria-label={`${id}-password`}
      color="secondary"
      onClick={event => togglePassword(event)}
      {...resetProps}
      sx={{
        padding: tiny ? theme.spacing(0.25) : theme.spacing(0.5),
        ...resetProps?.sx
      }}
    >
      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
    </IconButton>
  );
};

export const ResetInput = <T, P>({ props, state }: ComponentProps<T, P>) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const { id, preventResetRender, handleChange } = state;
  const { defaultValue = undefined, tiny = false, resetProps, onReset = null } = props;

  return preventResetRender ? null : (
    <Tooltip
      arrow
      title={
        defaultValue === undefined ? null : (
          <>
            <span style={{ color: theme.palette.text.secondary }}>{t('reset_to')}</span>
            <span>
              {typeof defaultValue === 'object'
                ? JSON.stringify(defaultValue)
                : typeof defaultValue === 'string'
                  ? `"${defaultValue}"`
                  : `${defaultValue}`}
            </span>
          </>
        )
      }
    >
      <IconButton
        aria-label={`${id}-reset`}
        type="reset"
        color="secondary"
        onClick={event => (onReset ? onReset(event) : handleChange(event, defaultValue as unknown as P))}
        {...resetProps}
        sx={{
          padding: tiny ? theme.spacing(0.25) : theme.spacing(0.5),
          ...resetProps?.sx
        }}
      >
        <RefreshOutlinedIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};

export const HelperText = <T, P>({ props, state }: ComponentProps<T, P>) => {
  const theme = useTheme();

  const { error, id } = state;

  const {
    disabled = false,
    errorProps = null,
    helperText = '',
    helperTextProps = null,
    loading = false,
    readOnly = false
  } = props;

  return disabled || loading || readOnly ? null : error ? (
    <FormHelperText
      id={`${id}-helper-text`}
      variant="outlined"
      {...errorProps}
      sx={{ color: theme.palette.error.main, ...errorProps?.sx }}
    >
      {error}
    </FormHelperText>
  ) : helperText ? (
    <FormHelperText
      id={`${id}-helper-text`}
      variant="outlined"
      {...helperTextProps}
      sx={{ color: theme.palette.text.secondary, ...helperTextProps?.sx }}
    >
      {helperText}
    </FormHelperText>
  ) : null;
};

export type ListInputProps = {
  button?: boolean;
  children?: React.ReactNode;
  buttonProps?: ListItemButtonProps;
  itemProps?: ListItemProps;
};

export const ListInput: React.FC<ListInputProps> = React.memo(
  ({ button = false, children = null, buttonProps = null, itemProps = null }: ListInputProps) => {
    switch (button) {
      case true:
        return <ListItemButton role={undefined} {...buttonProps} children={children} />;
      case false:
        return <ListItem {...itemProps} children={children} />;
      default:
        return null;
    }
  }
);

export const StyledCircularSkeleton = () => (
  <div style={{ minWidth: '40px', display: 'flex', justifyContent: 'center' }}>
    <Skeleton variant="circular" sx={{ height: '24px', width: '24px' }} />
  </div>
);

export const StyledInputSkeleton = <T, P>({ props }: ComponentProps<T, P>) => (
  <Skeleton sx={{ height: '40px', transform: 'unset', ...(props?.tiny && { height: '28px' }) }} />
);

export const StyledFormControl = <T, P>({ children, props }: ComponentProps<T, P>) => {
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

export const StyledButtonLabel = <T, P>({ props, state }: ComponentProps<T, P>) => {
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

export const StyledFormControlLabel = <T, P>({ props, children = null, state }: ComponentProps<T, P>) => {
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

export const StyledFormButton = ({ props, state, children = null }: ComponentProps<boolean, boolean>) => {
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
      onClick={event => handleChange(event, !value)}
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

export const StyledFormLabel = <T, P>({ props, state }: ComponentProps<T, P>) => {
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

export type StyledTextField<T, P> = TextFieldProps & ComponentProps<T, P>;

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
      onChange={e => handleChange(e, e.target.value)}
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
