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

export const StyledEndAdornmentBox = React.memo(<T, P>({ children, useStore }: ComponentProps<T, P>) => {
  const theme = useTheme();

  const [preventExpandRender] = useStore(s => s.preventExpandRender);
  const [preventPasswordRender] = useStore(s => s.preventPasswordRender);
  const [preventResetRender] = useStore(s => s.preventResetRender);

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
});

export const StyledEndAdornment = React.memo(<T, P>({ children, useStore }: ComponentProps<T, P>) => {
  const [preventExpandRender] = useStore(s => s.preventExpandRender);
  const [preventPasswordRender] = useStore(s => s.preventPasswordRender);
  const [preventResetRender] = useStore(s => s.preventResetRender);

  return preventResetRender && preventPasswordRender && preventExpandRender ? null : (
    <InputAdornment position="end">{children}</InputAdornment>
  );
});

export const ExpandInput = React.memo(<T, P>({ useStore }: ComponentProps<T, P>) => {
  const theme = useTheme();

  const [expand] = useStore(s => s.expand);
  const [expandProps] = useStore(s => s.expandProps);
  const [id] = useStore(s => s.id);
  const [preventExpandRender] = useStore(s => s.preventExpandRender);
  const [onExpand] = useStore(s => s.onExpand);

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
});

export const PasswordInput = React.memo(<T, P>({ useStore }: ComponentProps<T, P>) => {
  const theme = useTheme();

  const [, setStore] = useStore(s => s);
  const [id] = useStore(s => s.id);
  const [label] = useStore(s => s.label);
  const [preventPasswordRender] = useStore(s => s.preventPasswordRender);
  const [resetProps] = useStore(s => s.resetProps);
  const [showPassword] = useStore(s => s.showPassword);
  const [tiny] = useStore(s => s.tiny);

  return preventPasswordRender ? null : (
    <IconButton
      aria-label={`${id}-password`}
      color="secondary"
      onClick={() => setStore(s => ({ ...s, showPassword: !s.showPassword }))}
      {...resetProps}
      sx={{
        padding: tiny ? theme.spacing(0.25) : theme.spacing(0.5),
        ...resetProps?.sx
      }}
    >
      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
    </IconButton>
  );
});

export const ResetInput = React.memo(<T, P>({ useStore }: ComponentProps<T, P>) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const [defaultValue] = useStore(s => s.defaultValue);
  const [id] = useStore(s => s.id);
  const [preventResetRender] = useStore(s => s.preventResetRender);
  const [resetProps] = useStore(s => s.resetProps);
  const [tiny] = useStore(s => s.tiny);
  const [handleChange] = useStore(s => s.handleChange);
  const [onReset] = useStore(s => s.onReset);

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
        onClick={event => (onReset ? onReset(event) : handleChange(event, defaultValue as unknown as T))}
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
});

export const HelperText = React.memo(<T, P>({ useStore }: ComponentProps<T, P>) => {
  const theme = useTheme();

  const [disabled] = useStore(s => s.disabled);
  const [errorMsg] = useStore(s => s.errorMsg);
  const [errorProps] = useStore(s => s.errorProps);
  const [helperText] = useStore(s => s.helperText);
  const [helperTextProps] = useStore(s => s.helperTextProps);
  const [id] = useStore(s => s.id);
  const [loading] = useStore(s => s.loading);
  const [readOnly] = useStore(s => s.readOnly);

  return disabled || loading || readOnly ? null : errorMsg ? (
    <FormHelperText
      id={`${id}-helper-text`}
      variant="outlined"
      {...errorProps}
      sx={{ color: theme.palette.error.main, ...errorProps?.sx }}
    >
      {errorMsg}
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
});

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

export const StyledCircularSkeleton = React.memo(() => (
  <div style={{ minWidth: '40px', display: 'flex', justifyContent: 'center' }}>
    <Skeleton variant="circular" sx={{ height: '24px', width: '24px' }} />
  </div>
));

export const StyledInputSkeleton = React.memo(<T, P>({ useStore }: ComponentProps<T, P>) => {
  const [tiny] = useStore(s => s.tiny);

  return <Skeleton sx={{ height: '40px', transform: 'unset', ...(tiny && { height: '28px' }) }} />;
});

export const StyledFormControl = React.memo(<T, P>({ children, useStore }: ComponentProps<T, P>) => {
  const theme = useTheme();

  const [disabled] = useStore(s => s.disabled);
  const [divider] = useStore(s => s.divider);
  const [readOnly] = useStore(s => s.readOnly);

  return (
    <FormControl
      component="form"
      size="small"
      fullWidth
      {...(readOnly && !disabled && { focused: null })}
      sx={{
        ...(divider && { borderBottom: `1px solid ${theme.palette.divider}` }),
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
});

export const StyledButtonLabel = React.memo(<T, P>({ useStore }: ComponentProps<T, P>) => {
  const theme = useTheme();

  const [disabled] = useStore(s => s.disabled);
  const [endAdornment] = useStore(s => s.endAdornment);
  const [error] = useStore(s => s.error);
  const [focused] = useStore(s => s.focused);
  const [label] = useStore(s => s.label);
  const [labelProps] = useStore(s => s.labelProps);
  const [loading] = useStore(s => s.loading);
  const [monospace] = useStore(s => s.monospace);
  const [password] = useStore(s => s.password);
  const [preventDisabledColor] = useStore(s => s.preventDisabledColor);
  const [showOverflow] = useStore(s => s.showOverflow);
  const [showPassword] = useStore(s => s.showPassword);
  const [value] = useStore(s => s.value);

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
});

export const StyledFormControlLabel = React.memo(<T, P>({ children, useStore }: ComponentProps<T, P>) => {
  const [disabled] = useStore(s => s.disabled);
  const [loading] = useStore(s => s.loading);
  const [preventExpandRender] = useStore(s => s.preventExpandRender);
  const [preventPasswordRender] = useStore(s => s.preventPasswordRender);
  const [preventResetRender] = useStore(s => s.preventResetRender);
  const [readOnly] = useStore(s => s.readOnly);
  const [showOverflow] = useStore(s => s.showOverflow);
  const [tiny] = useStore(s => s.tiny);
  const [value] = useStore(s => s.value);

  return (
    <FormControlLabel
      control={loading ? <StyledCircularSkeleton /> : (children as React.ReactElement)}
      disabled={loading || disabled || readOnly}
      label={<StyledButtonLabel useStore={useStore} />}
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
});

export const StyledFormButton = React.memo(({ children, useStore }: ComponentProps<boolean, boolean>) => {
  const [label] = useStore(s => s.label);
  const [disabled] = useStore(s => s.disabled);
  const [loading] = useStore(s => s.loading);
  const [preventDisabledColor] = useStore(s => s.preventDisabledColor);
  const [readOnly] = useStore(s => s.readOnly);
  const [tiny] = useStore(s => s.tiny);
  const [value] = useStore(s => s.value);
  const [handleBlur] = useStore(s => s.handleBlur);
  const [handleChange] = useStore(s => s.handleChange);
  const [handleFocus] = useStore(s => s.handleFocus);

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
});

export const StyledFormLabel = React.memo(<T, P>({ useStore }: ComponentProps<T, P>) => {
  const theme = useTheme();

  const [disabled] = useStore(s => s.disabled);
  const [error] = useStore(s => s.error);
  const [focused] = useStore(s => s.focused);
  const [id] = useStore(s => s.id);
  const [label] = useStore(s => s.label);
  const [labelProps] = useStore(s => s.labelProps);
  const [preventDisabledColor] = useStore(s => s.preventDisabledColor);
  const [required] = useStore(s => s.required);
  const [tooltip] = useStore(s => s.tooltip);
  const [tooltipProps] = useStore(s => s.tooltipProps);
  const [value] = useStore(s => s.value);

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
});

export type StyledTextField<T, P> = TextFieldProps & ComponentProps<T, P>;

export const StyledTextField = React.memo(<T,>({ useStore, ...textFieldProps }: StyledTextField<T, string>) => {
  const theme = useTheme();

  const [disabled] = useStore(s => s.disabled);
  const [endAdornment] = useStore(s => s.endAdornment);
  const [error] = useStore(s => s.error);
  const [id] = useStore(s => s.id);
  const [inputValue] = useStore(s => s.inputValue);
  const [monospace] = useStore(s => s.monospace);
  const [password] = useStore(s => s.password);
  const [placeholder] = useStore(s => s.placeholder);
  const [readOnly] = useStore(s => s.readOnly);
  const [showPassword] = useStore(s => s.showPassword);
  const [startAdornment] = useStore(s => s.startAdornment);
  const [tiny] = useStore(s => s.tiny);
  const [handleBlur] = useStore(s => s.handleBlur);
  const [handleChange] = useStore(s => s.handleChange);
  const [handleFocus] = useStore(s => s.handleFocus);

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
          'aria-describedby': getAriaDescribedBy(null),
          placeholder: placeholder,
          readOnly: readOnly,
          startAdornment: startAdornment && <InputAdornment position="start">{startAdornment}</InputAdornment>,
          endAdornment: (
            <StyledEndAdornment useStore={useStore}>
              <PasswordInput useStore={useStore} />
              <ResetInput useStore={useStore} />
              {endAdornment}
            </StyledEndAdornment>
          ),
          ...textFieldProps?.slotProps?.input
        }
      }}
      onChange={e => handleChange(e, e.target.value as T)}
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
});
