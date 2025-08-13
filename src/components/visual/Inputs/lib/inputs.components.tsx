import { ExpandMore } from '@mui/icons-material';
import ClearIcon from '@mui/icons-material/Clear';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import type {
  AutocompleteProps,
  AutocompleteRenderInputParams,
  ButtonProps,
  FormControlLabelProps,
  FormControlProps,
  InputAdornmentProps,
  ListItemButtonProps,
  ListItemProps,
  ListItemTextProps,
  TextFieldProps
} from '@mui/material';
import {
  Autocomplete,
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
  ListItemText,
  Skeleton,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import type { CustomChipProps } from 'components/visual/CustomChip';
import { CustomChip } from 'components/visual/CustomChip';
import { useInputHandlers } from 'components/visual/Inputs/lib/inputs.hook';
import type { InputValues } from 'components/visual/Inputs/lib/inputs.model';
import { usePropStore } from 'components/visual/Inputs/lib/inputs.provider';
import { Tooltip } from 'components/visual/Tooltip';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const StyledRoot = React.memo(({ children }: { children: React.ReactNode }) => {
  const [get] = usePropStore();

  const rootProps = get('rootProps');

  return (
    <div {...rootProps} style={{ textAlign: 'left', ...rootProps?.style }}>
      {children}
    </div>
  );
});

export const StyledEndAdornmentBox = React.memo(
  ({ children, preventRender = true, ...props }: Partial<InputAdornmentProps> & { preventRender?: boolean }) => {
    const theme = useTheme();

    const [get] = usePropStore();

    const endAdornment = get('endAdornment');
    const preventExpandRender = get('preventExpandRender');
    const preventPasswordRender = get('preventPasswordRender');
    const preventResetRender = get('preventResetRender');

    return preventRender &&
      preventResetRender &&
      preventPasswordRender &&
      preventExpandRender &&
      !endAdornment ? null : (
      <InputAdornment
        position="end"
        {...props}
        sx={{
          position: 'absolute',
          right: theme.spacing(0.75),
          top: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          maxHeight: 'initial',
          color: theme.palette.text.secondary,
          ...props?.sx,
          '& .MuiTooltip-tooltip': {
            whiteSpace: 'nowrap'
          }
        }}
      >
        {children}
      </InputAdornment>
    );
  }
);

export const StyledEndAdornment = React.memo(
  ({ children, preventRender = true, ...props }: Partial<InputAdornmentProps> & { preventRender?: boolean }) => {
    const theme = useTheme();

    const [get] = usePropStore();

    const endAdornment = get('endAdornment');
    const preventExpandRender = get('preventExpandRender');
    const preventPasswordRender = get('preventPasswordRender');
    const preventResetRender = get('preventResetRender');

    return preventRender &&
      preventResetRender &&
      preventPasswordRender &&
      preventExpandRender &&
      !endAdornment ? null : (
      <InputAdornment
        position="end"
        {...props}
        sx={{ marginLeft: 0, color: theme.palette.text.secondary, ...props?.sx }}
      >
        {children}
      </InputAdornment>
    );
  }
);
export const ExpandInput = React.memo(() => {
  const theme = useTheme();

  const [get] = usePropStore();

  const expand = get('expand');
  const expandProps = get('expandProps');
  const id = get('id');
  const preventExpandRender = get('preventExpandRender');
  const onExpand = get('onExpand');

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

export const ClearInput = React.memo(() => {
  const theme = useTheme();

  const [get] = usePropStore<{ inputValue: string[] }>();

  const disabled = get('disabled');
  const expandProps = get('expandProps');
  const id = get('id');
  const inputValue = get('inputValue');
  const readOnly = get('readOnly');
  const tiny = get('tiny');

  const { handleChange } = useInputHandlers();

  return disabled || readOnly || !inputValue?.length ? null : (
    <ListItemIcon sx={{ minWidth: 0 }}>
      <IconButton
        aria-label={`${id}-clear`}
        color="secondary"
        type="button"
        onClick={event => {
          event.preventDefault();
          event.stopPropagation();
          handleChange(event, [], []);
        }}
        {...expandProps}
        sx={{
          padding: tiny ? theme.spacing(0.25) : theme.spacing(0.5),
          ...expandProps?.sx
        }}
      >
        <ClearIcon fontSize="small" />
      </IconButton>
    </ListItemIcon>
  );
});

export const PasswordInput = React.memo(() => {
  const theme = useTheme();

  const [get, setStore] = usePropStore();

  const id = get('id');
  const preventPasswordRender = get('preventPasswordRender');
  const resetProps = get('resetProps');
  const showPassword = get('showPassword');
  const tiny = get('tiny');

  return preventPasswordRender ? null : (
    <IconButton
      aria-label={`${id}-password`}
      color="secondary"
      type="button"
      onClick={() => setStore(s => ({ showPassword: !s.showPassword }))}
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

export const ResetInput = React.memo(<T, P extends InputValues<T>>() => {
  const { t } = useTranslation();
  const theme = useTheme();

  const [get] = usePropStore<P>();

  const defaultValue = get('defaultValue');
  const id = get('id');
  const preventResetRender = get('preventResetRender');
  const resetProps = get('resetProps');
  const tiny = get('tiny');
  const onReset = get('onReset');

  const { handleChange } = useInputHandlers();

  const title = useMemo<React.ReactNode>(
    () =>
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
      ),
    [defaultValue, t, theme.palette.text.secondary]
  );

  return preventResetRender ? null : (
    <Tooltip arrow title={title} placement="bottom">
      <IconButton
        aria-label={`${id}-reset`}
        type="reset"
        color="secondary"
        onClick={event => (onReset ? onReset(event) : handleChange(event, defaultValue, defaultValue))}
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

export const HelperText = React.memo(() => {
  const theme = useTheme();

  const [get] = usePropStore();

  const disabled = get('disabled');
  const errorMsg = get('errorMsg');
  const errorProps = get('errorProps');
  const helperText = get('helperText');
  const helperTextProps = get('helperTextProps');
  const id = get('id');
  const loading = get('loading');
  const readOnly = get('readOnly');

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

export const StyledCircularSkeleton = () => (
  <div style={{ minWidth: '40px', display: 'flex', justifyContent: 'center' }}>
    <Skeleton variant="circular" sx={{ height: '24px', width: '24px' }} />
  </div>
);

export const StyledInputSkeleton = React.memo(() => {
  const [get] = usePropStore();

  const tiny = get('tiny');

  return <Skeleton sx={{ height: '40px', transform: 'unset', ...(tiny && { height: '28px' }) }} />;
});

export const StyledFormControl = React.memo(({ children, ...props }: FormControlProps) => {
  const theme = useTheme();

  const [get] = usePropStore();

  const disabled = get('disabled');
  const divider = get('divider');
  const readOnly = get('readOnly');

  return (
    <FormControl
      component="form"
      size="small"
      fullWidth
      {...(readOnly && !disabled && { focused: null })}
      {...props}
      onSubmit={e => e.preventDefault()}
      sx={{
        ...props?.sx,
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

type RequiredBadgeProps = {
  children?: React.ReactNode;
  ignoreRequired?: boolean;
};

export const RequiredBadge = React.memo(
  <T, P extends InputValues<T>>({ children, ignoreRequired = false }: RequiredBadgeProps) => {
    const theme = useTheme();

    const [get] = usePropStore<P>();

    const required = get('required');

    return (
      <Badge
        color="error"
        variant="dot"
        invisible={!required || ignoreRequired}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        sx={{
          '& .MuiBadge-badge': {
            right: theme.spacing(-1),
            top: theme.spacing(0.5)
          }
        }}
      >
        {children}
      </Badge>
    );
  }
);

type StyledButtonLabelProps = {
  label?: string;
  focused?: boolean;
  ignoreRequired?: boolean;
};

export const StyledButtonLabel = React.memo(
  <T, P extends InputValues<T>>({
    label: labelProp,
    focused: focusedProp,
    ignoreRequired = false
  }: StyledButtonLabelProps) => {
    const theme = useTheme();

    const [get] = usePropStore<P>();

    const disabled = get('disabled');
    const endAdornment = get('endAdornment');
    const errorMsg = get('errorMsg');
    const focused = focusedProp ?? get('focused');
    const label = labelProp ?? get('label');
    const labelProps = get('labelProps');
    const loading = get('loading');
    const monospace = get('monospace');
    const overflowHidden = get('overflowHidden');
    const password = get('password');
    const preventDisabledColor = get('preventDisabledColor');
    const readOnly = get('readOnly');
    const required = get('required');
    const showPassword = get('showPassword');

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
            readOnly
              ? 'textPrimary'
              : !preventDisabledColor && (loading || disabled)
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
            ...(overflowHidden && { textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }),
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
          <RequiredBadge ignoreRequired={ignoreRequired}>{label}</RequiredBadge>
        </Typography>

        {endAdornment}
      </div>
    );
  }
);

type StyledFormControlLabel = Omit<FormControlLabelProps, 'control'> & {
  children: FormControlLabelProps['control'];
};

export const StyledFormControlLabel = React.memo(
  <T, P extends InputValues<T>>({ children, label, ...props }: StyledFormControlLabel) => {
    const [get] = usePropStore<P>();

    const disabled = get('disabled');
    const loading = get('loading');
    const preventExpandRender = get('preventExpandRender');
    const preventPasswordRender = get('preventPasswordRender');
    const preventResetRender = get('preventResetRender');
    const readOnly = get('readOnly');
    const overflowHidden = get('overflowHidden');
    const tiny = get('tiny');

    return (
      <FormControlLabel
        control={loading ? <StyledCircularSkeleton /> : (children as React.ReactElement)}
        disabled={loading || disabled || readOnly}
        label={label}
        {...props}
        slotProps={{ ...props?.slotProps, typography: { width: '100%', ...props?.slotProps?.typography } }}
        sx={{
          marginLeft: 0,
          marginRight: 0,
          paddingRight: `calc(44px + ${[preventExpandRender, preventPasswordRender, preventResetRender].filter(value => value === false).length} * ${tiny ? '24px' : '28px'})`,
          ...(overflowHidden && { textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }),
          ...props?.sx
        }}
      />
    );
  }
);

export const StyledFormButton = React.memo(({ children, ...props }: ButtonProps) => {
  const [get] = usePropStore();

  const disabled = get('disabled');
  const loading = get('loading');
  const password = get('password');
  const preventDisabledColor = get('preventDisabledColor');
  const readOnly = get('readOnly');
  const showPassword = get('showPassword');
  const tiny = get('tiny');

  return (
    <Button
      color="inherit"
      disabled={loading || disabled || readOnly}
      fullWidth
      size="small"
      {...props}
      sx={{
        justifyContent: 'start',
        color: 'inherit',
        textTransform: 'none',
        minHeight: tiny ? '32px' : '40px',
        ...((preventDisabledColor || readOnly) && { color: 'inherit !important' }),
        ...(password && showPassword && { wordBreak: 'break-all' }),
        ...props?.sx
      }}
    >
      {children}
    </Button>
  );
});

export const StyledFormLabel = React.memo(() => {
  const theme = useTheme();

  const [get] = usePropStore();

  const disabled = get('disabled');
  const errorMsg = get('errorMsg');
  const focused = get('focused');
  const id = get('id');
  const label = get('label');
  const labelProps = get('labelProps');
  const overflowHidden = get('overflowHidden');
  const preventDisabledColor = get('preventDisabledColor');
  const readOnly = get('readOnly');
  const tooltip = get('tooltip');
  const tooltipProps = get('tooltipProps');

  return (
    <Tooltip title={tooltip} {...tooltipProps}>
      <Typography
        color={readOnly ? 'textSecondary' : !disabled && errorMsg ? 'error' : focused ? 'primary' : 'textSecondary'}
        component={InputLabel}
        gutterBottom
        htmlFor={id}
        variant="body2"
        whiteSpace="nowrap"
        {...labelProps}
        sx={{
          ...(!overflowHidden && { whiteSpace: 'normal' }),
          ...(disabled &&
            !preventDisabledColor && {
              WebkitTextFillColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.38)'
            }),
          ...labelProps?.sx
        }}
      >
        <RequiredBadge>{label}</RequiredBadge>
      </Typography>
    </Tooltip>
  );
});

export const StyledListItemText = React.memo(({ primary, secondary = null, ...props }: ListItemTextProps) => {
  const [get] = usePropStore();

  const capitalize = get('capitalize');
  const overflowHidden = get('overflowHidden');
  const password = get('password');
  const showPassword = get('showPassword');
  const tiny = get('tiny');

  return (
    <ListItemText
      primary={primary}
      secondary={secondary}
      {...props}
      slotProps={{
        ...props?.slotProps,
        primary: {
          ...props?.slotProps?.primary,
          sx: {
            ...(capitalize && { textTransform: 'capitalize' }),
            ...(!overflowHidden && { overflow: 'auto', textOverflow: 'initial', whiteSpace: 'normal' }),
            ...(tiny && { variant: 'body2' })
          }
        },
        secondary: {
          ...props?.slotProps?.secondary,
          sx: {
            ...(!overflowHidden && { overflow: 'auto', textOverflow: 'initial', whiteSpace: 'normal' }),
            ...(tiny && { variant: 'body2' })
          }
        }
      }}
      sx={{
        marginTop: 'initial',
        marginBottom: 'initial',
        ...(password &&
          showPassword && {
            wordBreak: 'break-all',
            fontFamily: 'password',
            WebkitTextSecurity: 'disc',
            MozTextSecurity: 'disc',
            textSecurity: 'disc'
          }),
        ...props?.sx
      }}
    />
  );
});

export const useTextInputSlot = (overrides?: Partial<TextFieldProps>) => {
  const theme = useTheme();
  const [get] = usePropStore<{ autoComplete?: TextFieldProps['autoComplete'] }>();

  const autoComplete = get('autoComplete');
  const disabled = get('disabled');
  const errorMsg = get('errorMsg');
  const helperText = get('helperText');
  const id = get('id');
  const label = get('label');
  const loading = get('loading');
  const monospace = get('monospace');
  const overflowHidden = get('overflowHidden');
  const password = get('password');
  const placeholder = get('placeholder');
  const readOnly = get('readOnly');
  const showPassword = get('showPassword');
  const startAdornment = get('startAdornment');
  const tiny = get('tiny');

  return useMemo<TextFieldProps>(
    () => ({
      'aria-label': label,
      ...(disabled || loading || readOnly
        ? null
        : helperText || errorMsg
          ? { 'aria-describedby': `${id}-helper-text` }
          : null),
      autoComplete: autoComplete,
      disabled: disabled,
      error: !!errorMsg,
      fullWidth: true,
      id: id,
      margin: 'dense',
      size: 'small',
      variant: 'outlined',
      ...(readOnly && !disabled && { focused: null }),
      ...overrides,
      slotProps: {
        ...overrides?.slotProps,
        input: {
          placeholder,
          readOnly,
          startAdornment: startAdornment && <InputAdornment position="start">{startAdornment}</InputAdornment>,
          ...overrides?.slotProps?.input
        }
      },
      InputProps: {
        placeholder,
        readOnly,
        startAdornment: startAdornment && <InputAdornment position="start">{startAdornment}</InputAdornment>,
        ...overrides?.InputProps
      },
      sx: {
        margin: 0,
        '& .MuiInputBase-root': {
          paddingRight: '9px !important',
          ...(tiny && {
            paddingTop: '2px !important',
            paddingBottom: '2px !important',
            fontSize: '14px'
          }),
          ...(readOnly && !disabled && { cursor: 'default' })
        },
        '& .MuiInputBase-input': {
          paddingRight: '4px',
          ...(overflowHidden && {
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }),
          ...(readOnly && !disabled && { cursor: 'default' }),
          ...(monospace && { fontFamily: 'monospace' }),
          ...(tiny && { padding: '2.5px 4px 2.5px 8px' }),
          ...(password &&
            showPassword && {
              fontFamily: 'password',
              WebkitTextSecurity: 'disc',
              MozTextSecurity: 'disc',
              textSecurity: 'disc'
            })
        },
        '& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline': {
          ...(readOnly &&
            !disabled && {
              borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)'
            })
        },
        ...overrides?.sx
      }
    }),
    [
      autoComplete,
      disabled,
      errorMsg,
      helperText,
      id,
      label,
      loading,
      monospace,
      overflowHidden,
      overrides,
      password,
      placeholder,
      readOnly,
      showPassword,
      startAdornment,
      theme.palette.mode,
      tiny
    ]
  );
};

export type StyledTextField = TextFieldProps & {
  params?: AutocompleteRenderInputParams;
};

export const StyledTextField = React.memo(({ params, ...props }: StyledTextField) => {
  const [get] = usePropStore();

  const endAdornment = get('endAdornment');
  const placeholder = get('placeholder');
  const readOnly = get('readOnly');
  const startAdornment = get('startAdornment');

  const textInputSlot = useTextInputSlot();

  return (
    <TextField
      {...textInputSlot}
      {...params}
      {...props}
      slotProps={{
        ...textInputSlot?.slotProps,
        ...props?.slotProps,
        inputLabel: {
          ...props?.slotProps?.inputLabel,
          ...params?.InputLabelProps
        },
        input: {
          ...textInputSlot?.slotProps?.input,
          ...props?.slotProps?.input,
          ...params?.InputProps,
          placeholder: placeholder,
          readOnly: readOnly,
          startAdornment: (
            <>
              {startAdornment && <InputAdornment position="start">{startAdornment}</InputAdornment>}
              {params?.InputProps?.startAdornment}
            </>
          ),
          endAdornment: (
            <StyledEndAdornment preventRender={!props?.slotProps?.input?.['endAdornment']}>
              {props?.slotProps?.input?.['endAdornment']}
              {/* {params?.InputProps?.endAdornment} */}
              <PasswordInput />
              <ResetInput />
              {endAdornment}
            </StyledEndAdornment>
          )
        }
      }}
    />
  );
});

export type StyledAutocompleteProps<
  Value,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
  ChipComponent extends React.ElementType = 'div'
> = AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>;

export const StyledAutocomplete = <
  Value,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
  ChipComponent extends React.ElementType = 'div'
>({
  ...props
}: StyledAutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>) => {
  const [get] = usePropStore<StyledAutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>>();

  const autoComplete = get('autoComplete');
  const disabled = get('disabled');
  const id = get('id');
  const options = get('options');
  const readOnly = get('readOnly');

  return (
    <Autocomplete
      id={id}
      autoComplete={autoComplete}
      disableClearable
      disabled={disabled}
      freeSolo
      fullWidth
      options={options}
      readOnly={readOnly}
      size="small"
      {...props}
    />
  );
};

export const StyledCustomChip = React.memo(({ label, onDelete = () => null, sx, ...props }: CustomChipProps) => {
  const [get] = usePropStore();

  const disabled = get('disabled');
  const monospace = get('monospace');
  const password = get('password');
  const readOnly = get('readOnly');
  const showPassword = get('showPassword');

  return (
    <CustomChip
      label={label}
      wrap
      size="small"
      {...props}
      onDelete={disabled || readOnly ? undefined : onDelete}
      sx={{
        ...(readOnly && !disabled && { cursor: 'default' }),
        ...(monospace && { fontFamily: 'monospace' }),
        ...(password &&
          showPassword && {
            wordBreak: 'break-all',
            fontFamily: 'password',
            WebkitTextSecurity: 'disc',
            MozTextSecurity: 'disc',
            textSecurity: 'disc'
          }),
        ...sx
      }}
    />
  );
});
