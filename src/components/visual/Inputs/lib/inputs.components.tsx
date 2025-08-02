import { ExpandMore } from '@mui/icons-material';
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
  Skeleton,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import type { CustomChipProps } from 'components/visual/CustomChip';
import { CustomChip } from 'components/visual/CustomChip';
import { useDefaultHandlers } from 'components/visual/Inputs/lib/inputs.hook';
import type { InputValues } from 'components/visual/Inputs/lib/inputs.model';
import { usePropStore } from 'components/visual/Inputs/lib/inputs.provider';
import { Tooltip } from 'components/visual/Tooltip';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const StyledRoot = React.memo(({ children }: { children: React.ReactNode }) => {
  const [get] = usePropStore();

  const rootProps = get(s => s.rootProps);

  return (
    <div {...rootProps} style={{ textAlign: 'left', ...rootProps?.style }}>
      {children}
    </div>
  );
});

export const StyledEndAdornmentBox = React.memo(({ children }: Pick<InputAdornmentProps, 'children'>) => {
  const theme = useTheme();

  const [get] = usePropStore();

  const preventExpandRender = get(s => s.preventExpandRender);
  const preventPasswordRender = get(s => s.preventPasswordRender);
  const preventResetRender = get(s => s.preventResetRender);

  return preventResetRender && preventPasswordRender && preventExpandRender ? null : (
    <InputAdornment
      position="end"
      sx={{
        position: 'absolute',
        right: theme.spacing(0.75),
        top: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        maxHeight: 'initial'
      }}
    >
      {children}
    </InputAdornment>
  );
});

export const StyledEndAdornment = React.memo(({ children }: Pick<InputAdornmentProps, 'children'>) => {
  const [get] = usePropStore();

  const preventExpandRender = get(s => s.preventExpandRender);
  const preventPasswordRender = get(s => s.preventPasswordRender);
  const preventResetRender = get(s => s.preventResetRender);

  return preventResetRender && preventPasswordRender && preventExpandRender ? null : (
    <InputAdornment position="end">{children}</InputAdornment>
  );
});

export const ExpandInput = React.memo(() => {
  const theme = useTheme();

  const [get] = usePropStore();

  const expand = get(s => s.expand);
  const expandProps = get(s => s.expandProps);
  const id = get(s => s.id);
  const preventExpandRender = get(s => s.preventExpandRender);
  const onExpand = get(s => s.onExpand);

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

export const PasswordInput = React.memo(() => {
  const theme = useTheme();

  const [get, setStore] = usePropStore();

  const id = get(s => s.id);
  const preventPasswordRender = get(s => s.preventPasswordRender);
  const resetProps = get(s => s.resetProps);
  const showPassword = get(s => s.showPassword);
  const tiny = get(s => s.tiny);

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

export const ResetInput = React.memo(<T, P extends InputValues<T>>() => {
  const { t } = useTranslation();
  const theme = useTheme();

  const [get] = usePropStore<P>();

  const defaultValue = get(s => s.defaultValue);
  const id = get(s => s.id);
  const preventResetRender = get(s => s.preventResetRender);
  const resetProps = get(s => s.resetProps);
  const tiny = get(s => s.tiny);
  const onReset = get(s => s.onReset);

  const { handleChange } = useDefaultHandlers();

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

  const disabled = get(s => s.disabled);
  const errorMsg = get(s => s.errorMsg);
  const errorProps = get(s => s.errorProps);
  const helperText = get(s => s.helperText);
  const helperTextProps = get(s => s.helperTextProps);
  const id = get(s => s.id);
  const loading = get(s => s.loading);
  const readOnly = get(s => s.readOnly);

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

  const tiny = get(s => s.tiny);

  return <Skeleton sx={{ height: '40px', transform: 'unset', ...(tiny && { height: '28px' }) }} />;
});

export const StyledFormControl = React.memo(({ children, ...props }: FormControlProps) => {
  const theme = useTheme();

  const [get] = usePropStore();

  const disabled = get(s => s.disabled);
  const divider = get(s => s.divider);
  const readOnly = get(s => s.readOnly);

  return (
    <FormControl
      component="form"
      size="small"
      fullWidth
      {...(readOnly && !disabled && { focused: null })}
      {...props}
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

type StyledButtonLabelProps = {
  label?: string;
  focused?: boolean;
};

export const StyledButtonLabel = React.memo(
  <T, P extends InputValues<T>>({ label: labelProp, focused: focusedProp }: StyledButtonLabelProps) => {
    const theme = useTheme();

    const [get] = usePropStore<P>();

    const disabled = get(s => s.disabled);
    const endAdornment = get(s => s.endAdornment);
    const errorMsg = get(s => s.errorMsg);
    const focused = focusedProp ?? get(s => s.focused);
    const label = labelProp ?? get(s => s.label);
    const labelProps = get(s => s.labelProps);
    const loading = get(s => s.loading);
    const monospace = get(s => s.monospace);
    const password = get(s => s.password);
    const preventDisabledColor = get(s => s.preventDisabledColor);
    const required = get(s => s.required);
    const showOverflow = get(s => s.showOverflow);
    const showPassword = get(s => s.showPassword);

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
        <Badge color="error" variant="dot" invisible={!required}>
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
        </Badge>
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

    const disabled = get(s => s.disabled);
    const loading = get(s => s.loading);
    const preventExpandRender = get(s => s.preventExpandRender);
    const preventPasswordRender = get(s => s.preventPasswordRender);
    const preventResetRender = get(s => s.preventResetRender);
    const readOnly = get(s => s.readOnly);
    const showOverflow = get(s => s.showOverflow);
    const tiny = get(s => s.tiny);

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
          ...(!showOverflow && { textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }),
          ...props?.sx
        }}
      />
    );
  }
);

export const StyledFormButton = React.memo(({ children, ...props }: ButtonProps) => {
  const [get] = usePropStore();

  const disabled = get(s => s.disabled);
  const loading = get(s => s.loading);
  const preventDisabledColor = get(s => s.preventDisabledColor);
  const readOnly = get(s => s.readOnly);
  const tiny = get(s => s.tiny);

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

  const disabled = get(s => s.disabled);
  const errorMsg = get(s => s.errorMsg);
  const focused = get(s => s.focused);
  const id = get(s => s.id);
  const label = get(s => s.label);
  const labelProps = get(s => s.labelProps);
  const preventDisabledColor = get(s => s.preventDisabledColor);
  const required = get(s => s.required);
  const tooltip = get(s => s.tooltip);
  const tooltipProps = get(s => s.tooltipProps);

  return (
    <Tooltip title={tooltip} {...tooltipProps}>
      <Badge color="error" variant="dot" invisible={!required}>
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

export type StyledTextField = TextFieldProps & {
  params?: AutocompleteRenderInputParams;
};

export const StyledTextField = ({ params, ...props }: StyledTextField) => {
  const theme = useTheme();

  const [get] = usePropStore();

  const disabled = get(s => s.disabled);
  const endAdornment = get(s => s.endAdornment);
  const errorMsg = get(s => s.errorMsg);
  const id = get(s => s.id);
  const monospace = get(s => s.monospace);
  const password = get(s => s.password);
  const placeholder = get(s => s.placeholder);
  const readOnly = get(s => s.readOnly);
  const showPassword = get(s => s.showPassword);
  const startAdornment = get(s => s.startAdornment);
  const tiny = get(s => s.tiny);

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
          // 'aria-describedby': getAriaDescribedBy(props),
          placeholder: placeholder,
          readOnly: readOnly,
          // startAdornment: startAdornment && <InputAdornment position="start">{startAdornment}</InputAdornment>,
          startAdornment: (
            <>
              {startAdornment && <InputAdornment position="start">{startAdornment}</InputAdornment>}
              {params?.InputProps?.startAdornment}
            </>
          ),
          ...props?.slotProps?.input,
          ...params?.InputProps,
          endAdornment: (
            <StyledEndAdornment>
              <PasswordInput />
              <ResetInput />
              {endAdornment}
              {props?.slotProps?.input?.['endAdornment']}
              {params?.InputProps?.endAdornment}
            </StyledEndAdornment>
          )
        }
      }}
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

  const autoComplete = get(s => s.autoComplete);
  const disabled = get(s => s.disabled);
  const id = get(s => s.id);
  const options = get(s => s?.options ?? []);
  const readOnly = get(s => s.readOnly);

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

  const disabled = get(s => s.disabled);
  const monospace = get(s => s.monospace);
  const password = get(s => s.password);
  const readOnly = get(s => s.disabled);
  const showPassword = get(s => s.showPassword);

  return (
    <CustomChip
      label={label}
      wrap
      {...props}
      onDelete={disabled ? undefined : onDelete}
      sx={{
        ...(readOnly && !disabled && { cursor: 'default' }),
        ...(monospace && { fontFamily: 'monospace' }),
        ...(password &&
          showPassword && {
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
