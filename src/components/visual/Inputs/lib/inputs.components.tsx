import { ExpandMore } from '@mui/icons-material';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import type {
  AutocompleteRenderInputParams,
  ButtonProps,
  IconButtonProps,
  ListItemButtonProps,
  ListItemProps,
  TextFieldProps
} from '@mui/material';
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
import type { InputProps, InputState } from 'components/visual/Inputs/lib/inputs.model';
import { Tooltip } from 'components/visual/Tooltip';
import React from 'react';
import { useTranslation } from 'react-i18next';

type StyledEndAdornmentProps<T> = {
  children: React.ReactNode;
  preventExpandRender?: InputState<T>['preventExpandRender'];
  preventPasswordRender: InputState<T>['preventPasswordRender'];
  preventResetRender: InputState<T>['preventResetRender'];
};

export const StyledEndAdornmentBox = React.memo(
  <T,>({ children, preventExpandRender, preventPasswordRender, preventResetRender }: StyledEndAdornmentProps<T>) => {
    const theme = useTheme();

    return preventExpandRender && preventPasswordRender && preventResetRender ? null : (
      <InputAdornment
        position="end"
        sx={{
          position: 'absolute',
          right: theme.spacing(0.75),
          top: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {children}
      </InputAdornment>
    );
  }
);

export const StyledEndAdornment = React.memo(
  <T,>({ children, preventExpandRender, preventPasswordRender, preventResetRender }: StyledEndAdornmentProps<T>) =>
    preventExpandRender && preventPasswordRender && preventResetRender ? null : (
      <InputAdornment position="end">{children}</InputAdornment>
    )
);

type ExpandInputProps<T> = {
  expand: InputProps<T>['expand'];
  expandProps: InputProps<T>['expandProps'];
  id: InputProps<T>['id'];
  preventExpandRender: InputState<T>['preventExpandRender'];
  onExpand: InputProps<T>['onExpand'];
};

export const ExpandInput = <T,>({ expand, expandProps, id, preventExpandRender, onExpand }: ExpandInputProps<T>) => {
  const theme = useTheme();

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

type PasswordInputProps<T> = {
  id: InputProps<T>['id'];
  preventPasswordRender: InputState<T>['preventPasswordRender'];
  resetProps: InputProps<T>['resetProps'];
  showPassword: InputState<T>['showPassword'];
  tiny: InputProps<T>['tiny'];
  onClick: IconButtonProps['onClick'];
};

export const PasswordInput = <T,>({
  id,
  preventPasswordRender,
  resetProps,
  showPassword,
  tiny,
  onClick
}: PasswordInputProps<T>) => {
  const theme = useTheme();

  return preventPasswordRender ? null : (
    <IconButton
      aria-label={`${id}-password`}
      color="secondary"
      onClick={onClick}
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

type ResetInputProps<T> = {
  defaultValue: InputProps<T>['defaultValue'];
  id: InputProps<T>['id'];
  preventResetRender: InputState<T>['preventResetRender'];
  resetProps: InputProps<T>['resetProps'];
  tiny: InputProps<T>['tiny'];
  onChange: InputProps<T>['onChange'];
  onReset: InputProps<T>['onReset'];
};

export const ResetInput = <T,>({
  defaultValue = undefined,
  id,
  preventResetRender,
  resetProps,
  tiny,
  onChange,
  onReset
}: ResetInputProps<T>) => {
  const { t } = useTranslation();
  const theme = useTheme();

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
      slotProps={{ tooltip: { sx: {} } }}
    >
      <IconButton
        aria-label={`${id}-reset`}
        type="reset"
        color="secondary"
        onClick={event => (onReset ? onReset(event) : onChange(event, defaultValue))}
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

type HelperTextProps<T> = {
  disabled: InputProps<T>['disabled'];
  errorMsg: InputState<T>['errorMsg'];
  errorProps: InputProps<T>['errorProps'];
  helperText: InputProps<T>['helperText'];
  helperTextProps: InputProps<T>['helperTextProps'];
  id: InputProps<T>['id'];
  loading: InputProps<T>['loading'];
  readOnly: InputProps<T>['readOnly'];
};

export const HelperText = React.memo(
  <T,>({ disabled, errorMsg, errorProps, helperText, helperTextProps, id, loading, readOnly }: HelperTextProps<T>) => {
    const theme = useTheme();

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
  }
);

export type ListInputProps = {
  button?: boolean;
  children?: React.ReactNode;
  buttonProps?: ListItemButtonProps;
  itemProps?: ListItemProps;
};

export const ListInput: React.FC<ListInputProps> = ({
  button = false,
  children = null,
  buttonProps = null,
  itemProps = null
}: ListInputProps) => {
  switch (button) {
    case true:
      return <ListItemButton role={undefined} {...buttonProps} children={children} />;
    case false:
      return <ListItem {...itemProps} children={children} />;
    default:
      return null;
  }
};

export const StyledCircularSkeleton = () => (
  <div style={{ minWidth: '40px', display: 'flex', justifyContent: 'center' }}>
    <Skeleton variant="circular" sx={{ height: '24px', width: '24px' }} />
  </div>
);

export const StyledInputSkeleton = <T,>({ tiny }: { tiny: InputProps<T>['tiny'] }) => (
  <Skeleton sx={{ height: '40px', transform: 'unset', ...(tiny && { height: '28px' }) }} />
);

type StyledFormControlProps<T> = {
  children: React.ReactNode;
  disabled: InputProps<T>['disabled'];
  divider: InputProps<T>['divider'];
  readOnly: InputProps<T>['readOnly'];
};

export const StyledFormControl = React.memo(
  <T,>({ children, disabled, divider, readOnly }: StyledFormControlProps<T>) => {
    const theme = useTheme();

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
  }
);

type StyledButtonLabelProps<T> = {
  disabled: InputProps<T>['disabled'];
  endAdornment: InputProps<T>['endAdornment'];
  errorMsg: InputState<T>['errorMsg'];
  focused: InputState<T>['focused'];
  label: InputProps<T>['label'];
  labelProps: InputProps<T>['labelProps'];
  loading: InputProps<T>['loading'];
  monospace: InputProps<T>['monospace'];
  password: InputProps<T>['password'];
  preventDisabledColor: InputProps<T>['preventDisabledColor'];
  showOverflow: InputProps<T>['showOverflow'];
  showPassword: InputState<T>['showPassword'];
};

export const StyledButtonLabel = <T,>({
  disabled,
  endAdornment,
  errorMsg,
  focused,
  label,
  labelProps,
  loading,
  monospace,
  password,
  preventDisabledColor,
  showOverflow,
  showPassword
}: StyledButtonLabelProps<T>) => {
  const theme = useTheme();

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
            : errorMsg
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

type StyledFormControlLabelProps<T> = {
  children: React.ReactNode;
  label: React.ReactNode;
  disabled: InputProps<T>['disabled'];
  loading: InputProps<T>['loading'];
  preventExpandRender: InputState<T>['preventExpandRender'];
  preventPasswordRender: InputState<T>['preventPasswordRender'];
  preventResetRender: InputState<T>['preventResetRender'];
  readOnly: InputProps<T>['readOnly'];
  showOverflow: InputProps<T>['showOverflow'];
  tiny: InputProps<T>['tiny'];
};

export const StyledFormControlLabel = <T,>({
  children,
  disabled,
  label,
  loading,
  preventExpandRender,
  preventPasswordRender,
  preventResetRender,
  readOnly,
  showOverflow,
  tiny
}: StyledFormControlLabelProps<T>) => {
  return (
    <FormControlLabel
      control={loading ? <StyledCircularSkeleton /> : (children as React.ReactElement)}
      disabled={loading || disabled || readOnly}
      label={label}
      slotProps={{ typography: { width: '100%' } }}
      sx={{
        marginLeft: 0,
        marginRight: 0,
        paddingRight: `calc(44px + ${[preventExpandRender, preventPasswordRender, preventResetRender].filter(value => value === false).length} * ${tiny ? '24px' : '28px'})`,
        ...(!showOverflow && { textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' })
      }}
    />
  );
};

type StyledFormButtonProps<T> = {
  children: React.ReactNode;
  disabled: InputProps<T>['disabled'];
  loading: InputProps<T>['loading'];
  preventDisabledColor: InputProps<T>['preventDisabledColor'];
  readOnly: InputProps<T>['readOnly'];
  tiny: InputProps<T>['tiny'];
  onBlur: ButtonProps['onBlur'];
  onClick: ButtonProps['onClick'];
  onFocus: ButtonProps['onFocus'];
};

export const StyledFormButton = <T,>({
  children,
  disabled,
  loading,
  preventDisabledColor,
  readOnly,
  tiny,
  onBlur,
  onClick,
  onFocus
}: StyledFormButtonProps<T>) => {
  return (
    <Button
      color="inherit"
      disabled={loading || disabled || readOnly}
      fullWidth
      size="small"
      onClick={onClick}
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

type StyledFormLabelProps<T> = {
  disabled: InputProps<T>['disabled'];
  errorMsg: InputState<T>['errorMsg'];
  focused: InputState<T>['focused'];
  id: InputProps<T>['id'];
  label: InputProps<T>['label'];
  labelProps: InputProps<T>['labelProps'];
  preventDisabledColor: InputProps<T>['preventDisabledColor'];
  tooltip: InputProps<T>['tooltip'];
  tooltipProps: InputProps<T>['tooltipProps'];
};

export const StyledFormLabel = React.memo(
  <T,>({
    disabled,
    errorMsg,
    focused,
    id,
    label,
    labelProps,
    preventDisabledColor,
    tooltip,
    tooltipProps
  }: StyledFormLabelProps<T>) => {
    const theme = useTheme();

    return (
      <Tooltip title={tooltip} {...tooltipProps}>
        <Badge color="error" variant="dot" invisible={!errorMsg}>
          <Typography
            color={!disabled && errorMsg ? 'error' : focused ? 'primary' : 'textSecondary'}
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
                  WebkitTextFillColor:
                    theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.38)'
                })
            }}
          >
            {label}
          </Typography>
        </Badge>
      </Tooltip>
    );
  }
);

export type StyledTextField<T> = TextFieldProps & {
  disabled?: InputProps<T>['disabled'];
  errorMsg?: InputState<T>['errorMsg'];
  id?: InputProps<T>['id'];
  monospace?: InputProps<T>['monospace'];
  password?: InputProps<T>['password'];
  placeholder?: InputProps<T>['placeholder'];
  readOnly?: InputProps<T>['readOnly'];
  showPassword?: InputState<T>['showPassword'];
  startAdornment?: InputProps<T>['startAdornment'];
  tiny?: InputProps<T>['tiny'];
  params?: AutocompleteRenderInputParams;
};

export const StyledTextField = <T,>({
  disabled,
  // endAdornment,
  errorMsg,
  id,
  monospace,
  password,
  placeholder,
  readOnly,
  showPassword,
  startAdornment,
  tiny,
  params,
  ...props
}: StyledTextField<T>) => {
  const theme = useTheme();

  return (
    <TextField
      id={id}
      disabled={disabled}
      error={!!errorMsg}
      fullWidth
      margin="dense"
      size="small"
      type={password && showPassword ? 'password' : 'text'}
      variant="outlined"
      {...(readOnly && !disabled && { focused: null })}
      {...params}
      {...props}
      slotProps={{
        ...props?.slotProps,
        inputLabel: {
          ...props?.slotProps?.inputLabel,
          ...params?.InputLabelProps
        },
        input: {
          ...props?.slotProps?.input,
          ...params?.InputProps
        }
      }}
      // slotProps={{
      //   ...props?.slotProps,
      //   input: {
      //     ...props?.slotProps?.input,
      //     ...props?.inputProps
      //     // 'aria-describedby': getAriaDescribedBy(props),
      //     // placeholder: placeholder,
      //     // readOnly: readOnly,
      //     // startAdornment: startAdornment && <InputAdornment position="start">{startAdornment}</InputAdornment>
      //   }
      // }}
      // slotProps={{
      //   ...props?.slotProps,
      //   input: {
      //     ...props?.slotProps?.input,
      //     // 'aria-describedby': getAriaDescribedBy(props),
      //     placeholder: placeholder,
      //     readOnly: readOnly,
      //     startAdornment: startAdornment && <InputAdornment position="start">{startAdornment}</InputAdornment>
      //   }
      // }}
      sx={{
        ...props?.sx,
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
