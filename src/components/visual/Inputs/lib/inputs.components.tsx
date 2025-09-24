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
import {
  useInputChange,
  usePreventClearRender,
  usePreventExpandRender,
  usePreventMenuRender,
  usePreventPasswordRender,
  usePreventResetRender,
  usePreventSpinnerRender,
  usePropID,
  usePropLabel
} from 'components/visual/Inputs/lib/inputs.hook';
import type { InputValues } from 'components/visual/Inputs/lib/inputs.model';
import { usePropStore } from 'components/visual/Inputs/lib/inputs.provider';
import { Tooltip } from 'components/visual/Tooltip';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export const StyledRoot = React.memo(({ children }: { children: React.ReactNode }) => {
  const [get] = usePropStore();

  const id = usePropID();
  const rootProps = get('rootProps');

  return (
    <div {...rootProps} id={`${id}-root`} style={{ textAlign: 'left', ...rootProps?.style }}>
      {children}
    </div>
  );
});

export const StyledEndAdornmentBox = React.memo(
  ({ children, preventRender = true, ...props }: Partial<InputAdornmentProps> & { preventRender?: boolean }) => {
    const theme = useTheme();

    const [get] = usePropStore();

    const endAdornment = get('endAdornment');

    const preventClearRender = usePreventClearRender();
    const preventExpandRender = usePreventExpandRender();
    const preventMenuRender = usePreventMenuRender();
    const preventPasswordRender = usePreventPasswordRender();
    const preventResetRender = usePreventResetRender();
    const preventSpinnerRender = usePreventSpinnerRender();

    return preventRender &&
      !endAdornment &&
      preventClearRender &&
      preventExpandRender &&
      preventMenuRender &&
      preventPasswordRender &&
      preventResetRender &&
      preventSpinnerRender ? null : (
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

    const preventClearRender = usePreventClearRender();
    const preventExpandRender = usePreventExpandRender();
    const preventMenuRender = usePreventMenuRender();
    const preventPasswordRender = usePreventPasswordRender();
    const preventResetRender = usePreventResetRender();
    const preventSpinnerRender = usePreventSpinnerRender();

    return preventRender &&
      !endAdornment &&
      preventClearRender &&
      preventExpandRender &&
      preventMenuRender &&
      preventPasswordRender &&
      preventResetRender &&
      preventSpinnerRender ? null : (
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

export const ExpandAdornment = React.memo(() => {
  const theme = useTheme();

  const [get] = usePropStore();

  const expand = get('expand');
  const expandProps = get('expandProps');
  const onExpand = get('onExpand');

  const id = usePropID();
  const preventExpandRender = usePreventExpandRender();

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

export const ClearAdornment = React.memo(() => {
  const theme = useTheme();

  const [get] = usePropStore<{ inputValue: string[] }>();

  const disabled = get('disabled');
  const expandProps = get('expandProps');
  const id = usePropID();
  const inputValue = get('inputValue');
  const tiny = get('tiny');

  const preventClearRender = usePreventClearRender();
  const handleChange = useInputChange();

  return preventClearRender ? null : (
    <ListItemIcon sx={{ minWidth: 0 }}>
      <IconButton
        aria-label={`${id}-clear`}
        color="secondary"
        disabled={disabled || !inputValue?.length}
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

export const PasswordAdornment = React.memo(() => {
  const theme = useTheme();

  const [get, setStore] = usePropStore();

  const disabled = get('disabled');
  const resetProps = get('resetProps');
  const showPassword = get('showPassword');
  const tiny = get('tiny');

  const id = usePropID();
  const preventPasswordRender = usePreventPasswordRender();

  return preventPasswordRender ? null : (
    <IconButton
      aria-label={`${id}-password`}
      color="secondary"
      disabled={disabled}
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

export const ResetAdornment = React.memo(<T, P extends InputValues<T>>() => {
  const { t } = useTranslation('inputs');
  const theme = useTheme();

  const [get] = usePropStore<P>();

  const defaultValue = get('defaultValue');
  const disabled = get('disabled');
  const resetProps = get('resetProps');
  const tiny = get('tiny');
  const onReset = get('onReset');

  const id = usePropID();
  const preventResetRender = usePreventResetRender();
  const handleChange = useInputChange();

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
        color="secondary"
        disabled={disabled}
        type="reset"
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

export const MenuAdornment = React.memo(() => {
  const theme = useTheme();

  const [get, setStore] = usePropStore();

  const disabled = get('disabled');
  const resetProps = get('resetProps');
  const showMenu = get('showMenu');
  const tiny = get('tiny');

  const id = usePropID();
  const preventMenuRender = usePreventMenuRender();

  return preventMenuRender ? null : (
    <IconButton
      aria-label={`${id}-select-menu`}
      color="secondary"
      disabled={disabled}
      type="button"
      tabIndex={-1}
      onClick={() => setStore({ showMenu: true })}
      {...resetProps}
      sx={{
        padding: tiny ? theme.spacing(0.75) : theme.spacing(1),
        transition: theme.transitions.create('transform', {
          duration: theme.transitions.duration.shortest
        }),
        transform: showMenu ? 'rotate(180deg)' : 'rotate(0deg)',
        ...resetProps?.sx
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M0 8 L12 20 L24 8 Z" />
      </svg>
    </IconButton>
  );
});

export const SpinnerAdornment = <T, P extends InputValues<T>>() => {
  const theme = useTheme();
  const [get] = usePropStore<P & { max?: number; min?: number; step?: number }>();

  const disabled = get('disabled');
  const focused = get('focused');
  const inputValue = Number(get('inputValue') ?? 0);
  const max = get('max');
  const min = get('min');
  const step = get('step') ?? 1;
  const tiny = get('tiny');

  const id = usePropID();
  const preventSpinnerRender = usePreventSpinnerRender();
  const handleChange = useInputChange();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const mouseYRef = useRef<number>(null);
  const timeoutRef = useRef<NodeJS.Timeout>(null);
  const intervalRef = useRef<NodeJS.Timeout>(null);

  const clamp = useCallback(
    (val: number) => Math.min(max ?? Number.POSITIVE_INFINITY, Math.max(min ?? Number.NEGATIVE_INFINITY, val)),
    [max, min]
  );

  const focusInputIfNeeded = useCallback(() => {
    if (!inputRef.current) {
      const el = document.getElementById(id) as HTMLInputElement | null;
      if (el) inputRef.current = el;
    }
    if (!focused) inputRef.current?.focus();
  }, [focused, id]);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent | React.TouchEvent, initialValue: number, delta: number) => {
      event.stopPropagation();
      event.preventDefault();
      focusInputIfNeeded();
      let nextValue = clamp(initialValue + delta);
      const absDelta = Math.abs(delta);
      handleChange(event, nextValue ? String(nextValue) : null, nextValue);

      timeoutRef.current = setTimeout(() => {
        if (timeoutRef.current) {
          intervalRef.current = setInterval(() => {
            const rect = boxRef.current.getBoundingClientRect();
            const centerY = rect.top + rect.height / 2;
            const stepDir = centerY > mouseYRef.current ? absDelta : -absDelta;
            nextValue = clamp(nextValue + stepDir);
            handleChange(event, nextValue ? String(nextValue) : null, nextValue);
          }, 50);
        }
      }, 150);
    },
    [clamp, focusInputIfNeeded, handleChange]
  );

  useEffect(() => {
    const handleMouseUp = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouseYRef.current = event.clientY;
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return preventSpinnerRender ? null : (
    <div
      ref={boxRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: tiny ? '30px' : '38px',
        width: '24px'
      }}
    >
      <Button
        color="secondary"
        disabled={disabled}
        size="small"
        tabIndex={-1}
        onMouseDown={e => handleMouseDown(e, inputValue, step)}
        onTouchStart={e => handleMouseDown(e, inputValue, step)}
        sx={{
          flex: 1,
          minWidth: 'initial',
          minHeight: 0,
          p: 0,
          borderRadius: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" style={{ marginBottom: theme.spacing(-1) }}>
          <path d="M0 16 L12 4 L24 16 Z" />
        </svg>
      </Button>
      <Button
        color="secondary"
        disabled={disabled}
        size="small"
        tabIndex={-1}
        onMouseDown={e => handleMouseDown(e, inputValue, -step)}
        onTouchStart={e => handleMouseDown(e, inputValue, -step)}
        sx={{
          flex: 1,
          minWidth: 'initial',
          minHeight: 0,
          p: 0,
          borderRadius: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" style={{ marginTop: theme.spacing(-1) }}>
          <path d="M0 8 L12 20 L24 8 Z" />
        </svg>
      </Button>
    </div>
  );
};

export const HelperText = React.memo(() => {
  const theme = useTheme();

  const [get] = usePropStore();

  const disabled = get('disabled');
  const errorMessage = get('errorMessage');
  const errorProps = get('errorProps');
  const helperText = get('helperText');
  const helperTextProps = get('helperTextProps');
  const id = usePropID();
  const loading = get('loading');
  const readOnly = get('readOnly');

  return disabled || loading || readOnly ? null : errorMessage ? (
    <FormHelperText
      id={`${id}-helper-text`}
      variant="outlined"
      {...errorProps}
      sx={{ color: theme.palette.error.main, ...errorProps?.sx }}
    >
      {errorMessage}
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
  const id = usePropID();
  const readOnly = get('readOnly');

  return (
    <FormControl
      id={`${id}-form`}
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

    const badge = get('badge');
    const overflowHidden = get('overflowHidden');

    return (
      <Badge
        color="error"
        variant="dot"
        invisible={!badge || ignoreRequired}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        sx={{
          ...(overflowHidden && {
            display: 'inline-flex',
            alignItems: 'center',
            minWidth: 0,
            maxWidth: '100%',
            overflow: 'hidden'
          }),
          '& .MuiBadge-badge': {
            right: theme.spacing(-1),
            top: theme.spacing(0.5)
          }
        }}
      >
        <span
          style={
            !overflowHidden
              ? null
              : {
                  display: 'inline-block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  minWidth: 0,
                  maxWidth: '100%'
                }
          }
        >
          {children}
        </span>
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
    const errorMessage = get('errorMessage');
    const focused = focusedProp ?? get('focused');
    const label = labelProp ?? get('label');
    const labelProps = get('labelProps');
    const loading = get('loading');
    const monospace = get('monospace');
    const password = get('password');
    const preventDisabledColor = get('preventDisabledColor');
    const readOnly = get('readOnly');
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
            !preventDisabledColor && (loading || disabled)
              ? 'textDisabled'
              : readOnly
                ? 'textPrimary'
                : errorMessage
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
    const preventExpandRender = usePreventExpandRender();
    const preventPasswordRender = usePreventPasswordRender();
    const preventResetRender = usePreventResetRender();
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
        ...(disabled && preventDisabledColor && { color: 'inherit !important' }),
        ...(readOnly && !disabled && { color: 'inherit !important', pointerEvents: 'none', userSelect: 'text' }),
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
  const errorMessage = get('errorMessage');
  const focused = get('focused');
  const id = usePropID();
  const label = usePropLabel();
  const labelProps = get('labelProps');
  const loading = get('loading');
  const overflowHidden = get('overflowHidden');
  const preventDisabledColor = get('preventDisabledColor');
  const readOnly = get('readOnly');
  const tooltip = get('tooltip');
  const tooltipProps = get('tooltipProps');

  return (
    <Tooltip title={tooltip} {...tooltipProps}>
      <Typography
        color={
          !preventDisabledColor && (loading || disabled)
            ? 'textDisabled'
            : readOnly
              ? 'textSecondary'
              : errorMessage
                ? 'error'
                : focused
                  ? 'primary'
                  : 'textSecondary'
        }
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
          ...(tiny && { variant: 'body2' }),
          sx: {
            ...(capitalize && { textTransform: 'capitalize' }),
            ...(!overflowHidden && { overflow: 'auto', textOverflow: 'initial', whiteSpace: 'normal' })
          }
        },
        secondary: {
          ...props?.slotProps?.secondary,
          ...(tiny && { variant: 'body2' }),
          sx: {
            ...(!overflowHidden && { overflow: 'auto', textOverflow: 'initial', whiteSpace: 'normal' })
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
  const errorMessage = get('errorMessage');
  const helperText = get('helperText');
  const id = usePropID();
  const label = usePropLabel();
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
        : helperText || errorMessage
          ? { 'aria-describedby': `${id}-helper-text` }
          : null),
      autoComplete: autoComplete,
      disabled: disabled,
      error: !!errorMessage,
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
          minHeight: '32px',
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
          ...(tiny && {
            paddingTop: '2.5px ',
            paddingBottom: '2.5px '
          }),
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
        '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
          WebkitAppearance: 'none',
          margin: 0
        },
        '& input[type=number]': {
          MozAppearance: 'textfield'
        },
        ...overrides?.sx
      }
    }),
    [
      autoComplete,
      disabled,
      errorMessage,
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
              {endAdornment}
              <PasswordAdornment />
              <ResetAdornment />
              <SpinnerAdornment />
              <ClearAdornment />
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
  const id = usePropID();
  const options = get('options') ?? [];
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
        ...(readOnly && !disabled && { cursor: 'default', userSelect: 'text' }),
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
