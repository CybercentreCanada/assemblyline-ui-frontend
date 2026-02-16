import { ExpandMore } from '@mui/icons-material';
import ClearIcon from '@mui/icons-material/Clear';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import type { InputAdornmentProps } from '@mui/material';
import { CircularProgress, InputAdornment, Tooltip, useTheme } from '@mui/material';
import { usePropStore } from 'components/core/PropProvider/PropProvider';
import type { ButtonProps } from 'components/visual/Buttons/Button';
import { Button } from 'components/visual/Buttons/Button';
import { IconButton } from 'components/visual/Buttons/IconButton';
import { useInputBlur, useInputChange } from 'components/visual/Inputs/hooks/inputs.hook.event_handlers';
import {
  useInputId,
  useShouldRenderAdornments,
  useShouldRenderClear,
  useShouldRenderExpand,
  useShouldRenderHelp,
  useShouldRenderMenu,
  useShouldRenderNumericalSpinner,
  useShouldRenderPassword,
  useShouldRenderProgress,
  useShouldRenderReset
} from 'components/visual/Inputs/hooks/inputs.hook.renderer';
import type { InputControllerProps } from 'components/visual/Inputs/models/inputs.model';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export type InputButtonAdornmentProps = {
  variant?: 'icon' | 'text';
};

export const ClearInputAdornment = React.memo(({ variant = 'icon' }: InputButtonAdornmentProps) => {
  const { t } = useTranslation('inputs');
  const theme = useTheme();

  const [get] = usePropStore<InputControllerProps<string[], string[]>>();

  const clearAdornmentProps = get('slotProps')?.clearAdornment;
  const disabled = get('disabled');
  const id = useInputId();
  const rawValue = get('rawValue');
  const shouldRenderClear = useShouldRenderClear();
  const tiny = get('tiny');

  const handleBlur = useInputBlur();

  if (!shouldRenderClear) return null;
  else if (variant === 'icon')
    return (
      <IconButton
        id={`${id}-clear-adornment`}
        color="secondary"
        disabled={disabled || !rawValue?.length}
        tabIndex={-1}
        tooltip={t('adornment.clear.tooltip')}
        tooltipProps={{ arrow: true }}
        type="button"
        onClick={event => {
          event.preventDefault();
          event.stopPropagation();
          handleBlur(event as any, []);
        }}
        {...clearAdornmentProps}
        sx={{
          padding: tiny ? theme.spacing(0.25) : theme.spacing(0.5),
          ...clearAdornmentProps?.sx
        }}
      >
        <ClearIcon fontSize="small" />
      </IconButton>
    );
  else if (variant === 'text')
    return (
      <Button
        id={`${id}-clear-adornment`}
        color="secondary"
        disabled={disabled || !rawValue?.length}
        disableElevation
        size="small"
        tabIndex={-1}
        type="button"
        variant="outlined"
        onClick={event => {
          event.preventDefault();
          event.stopPropagation();
          handleBlur(event as any, []);
        }}
        {...(clearAdornmentProps as ButtonProps)}
        sx={{
          ...(tiny && { padding: 0 }),
          ...clearAdornmentProps?.sx
        }}
      >
        {t('adornment.clear.text')}
      </Button>
    );
  else return null;
});

ClearInputAdornment.displayName = 'ClearInputAdornment';

export const ExpandInputAdornment = React.memo(({ variant = 'icon' }: InputButtonAdornmentProps) => {
  const { t } = useTranslation('inputs');
  const theme = useTheme();

  const [get] = usePropStore<InputControllerProps>();

  const disabled = get('disabled');
  const expand = get('expand');
  const expandAdornmentProps = get('slotProps')?.expandAdornment;
  const id = useInputId();
  const onExpand = get('onExpand');
  const shouldRenderExpand = useShouldRenderExpand();
  const tiny = get('tiny');

  if (!shouldRenderExpand) return null;
  else if (variant === 'icon')
    return (
      <IconButton
        id={`${id}-expand-adornment`}
        color="secondary"
        disabled={disabled}
        tabIndex={-1}
        tooltip={expand ? t('adornment.collapse.tooltip') : t('adornment.expand.tooltip')}
        tooltipProps={{ arrow: true }}
        type="button"
        onClick={event => {
          event.preventDefault();
          event.stopPropagation();
          onExpand(event);
        }}
        {...expandAdornmentProps}
        sx={{
          padding: tiny ? theme.spacing(0.25) : theme.spacing(0.5),
          ...expandAdornmentProps?.sx
        }}
      >
        <ExpandMore
          fontSize="small"
          sx={{
            transition: theme.transitions.create('transform', {
              duration: theme.transitions.duration.shortest
            }),
            transform: expand ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
        />
      </IconButton>
    );
  else if (variant === 'text')
    return (
      <Button
        id={`${id}-expand-adornment`}
        color="secondary"
        disabled={disabled}
        disableElevation
        size="small"
        tabIndex={-1}
        type="button"
        variant="outlined"
        onClick={event => {
          event.preventDefault();
          event.stopPropagation();
          onExpand(event);
        }}
        {...(expandAdornmentProps as ButtonProps)}
        sx={{
          ...(tiny && { padding: 0 }),
          ...expandAdornmentProps?.sx
        }}
      >
        {expand ? t('adornment.collapse.text') : t('adornment.expand.text')}
      </Button>
    );
  else return null;
});

ExpandInputAdornment.displayName = 'ExpandInputAdornment';

export const HelpInputAdornment = React.memo(({ variant = 'icon' }: InputButtonAdornmentProps) => {
  const { t } = useTranslation('inputs');
  const theme = useTheme();

  const [get] = usePropStore<InputControllerProps>();

  const disabled = get('disabled');
  const helpAdornmentProps = get('slotProps')?.helpAdornment;
  const helpLink = get('helpLink');
  const helpName = get('helpName');
  const id = useInputId();
  const shouldRenderHelp = useShouldRenderHelp();
  const tiny = get('tiny');

  const isExternal = helpLink?.startsWith('http');

  if (!shouldRenderHelp) return null;
  else if (variant === 'icon')
    return (
      <IconButton
        id={`${id}-help-adornment`}
        color="secondary"
        disabled={disabled}
        tabIndex={-1}
        to={helpLink}
        tooltip={
          <>
            <span style={{ color: theme.palette.text.secondary }}>{t('adornment.help.tooltip')}</span>
            <span>{helpName ?? helpLink}</span>
          </>
        }
        tooltipProps={{ arrow: true }}
        type="button"
        {...(isExternal && { target: '_blank', rel: 'noopener noreferrer' })}
        onClick={event => {
          event.stopPropagation();
        }}
        {...helpAdornmentProps}
        sx={{
          padding: tiny ? theme.spacing(0.25) : theme.spacing(0.5),
          ...helpAdornmentProps?.sx
        }}
      >
        <HelpOutlineOutlinedIcon fontSize="small" />
      </IconButton>
    );
  else if (variant === 'text')
    return (
      <Button
        id={`${id}-help-adornment`}
        color="secondary"
        disabled={disabled}
        disableElevation
        size="small"
        tabIndex={-1}
        to={helpLink}
        tooltip={
          <>
            <span style={{ color: theme.palette.text.secondary }}>{t('adornment.help.tooltip')}</span>
            <span>{helpName ?? helpLink}</span>
          </>
        }
        tooltipProps={{ arrow: true }}
        type="button"
        variant="outlined"
        {...(isExternal && { target: '_blank', rel: 'noopener noreferrer' })}
        onClick={event => {
          event.stopPropagation();
        }}
        {...(helpAdornmentProps as ButtonProps)}
        sx={{
          ...(tiny && { padding: 0 }),
          ...helpAdornmentProps?.sx
        }}
      >
        {t('adornment.help.text')}
      </Button>
    );
  else return null;
});

HelpInputAdornment.displayName = 'HelpInputAdornment';

export const MenuInputAdornment = React.memo(({ variant = 'icon' }: InputButtonAdornmentProps) => {
  const { t } = useTranslation('inputs');
  const theme = useTheme();

  const [get, setStore] = usePropStore<InputControllerProps>();

  const disabled = get('disabled');
  const id = useInputId();
  const isMenuOpen = get('isMenuOpen');
  const menuAdornmentProps = get('slotProps')?.menuAdornment;
  const shouldRenderMenu = useShouldRenderMenu();
  const tiny = get('tiny');

  if (!shouldRenderMenu) return null;
  else if (variant === 'icon')
    return (
      <IconButton
        id={`${id}-menu-adornment`}
        color="secondary"
        disabled={disabled}
        tabIndex={-1}
        tooltip={t('adornment.menu.tooltip')}
        tooltipProps={{ arrow: true }}
        type="button"
        onClick={event => {
          event.preventDefault();
          event.stopPropagation();
          setStore({ isMenuOpen: true });
        }}
        {...menuAdornmentProps}
        sx={{
          padding: tiny ? theme.spacing(0.75) : theme.spacing(1),
          transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest
          }),
          transform: isMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          ...menuAdornmentProps?.sx
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M0 8 L12 20 L24 8 Z" />
        </svg>
      </IconButton>
    );
  else if (variant === 'text')
    return (
      <Button
        id={`${id}-menu-adornment`}
        color="secondary"
        disabled={disabled}
        disableElevation
        size="small"
        tabIndex={-1}
        type="button"
        variant="outlined"
        onClick={event => {
          event.preventDefault();
          event.stopPropagation();
          setStore({ isMenuOpen: true });
        }}
        {...(menuAdornmentProps as ButtonProps)}
        sx={{
          ...(tiny && { padding: 0 }),
          ...menuAdornmentProps?.sx
        }}
      >
        {t('adornment.menu.text')}
      </Button>
    );
  else return null;
});

MenuInputAdornment.displayName = 'MenuInputAdornment';

export const NumericalSpinnerInputAdornment = () => {
  const theme = useTheme();
  const [get] = usePropStore<InputControllerProps & { max?: number; min?: number; step?: number }>();

  const disabled = get('disabled');
  const isFocused = get('isFocused');
  const rawValue = Number(get('rawValue') ?? 0);
  const max = get('max');
  const min = get('min');
  const step = get('step') ?? 1;
  const tiny = get('tiny');

  const id = useInputId();
  const shouldRenderSpinner = useShouldRenderNumericalSpinner();
  const handleChange = useInputChange();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const mouseYRef = useRef<number>(null);
  const timeoutRef = useRef<NodeJS.Timeout>(null);
  const intervalRef = useRef<NodeJS.Timeout>(null);

  const toRawValue = useCallback((v: number) => (v == null ? '' : String(v)), []);
  const toValue = useCallback((v: string): number => (v !== '' ? Number(v) : null), []);

  const clamp = useCallback(
    (val: number) => Math.min(max ?? Number.POSITIVE_INFINITY, Math.max(min ?? Number.NEGATIVE_INFINITY, val)),
    [max, min]
  );

  const focusInputIfNeeded = useCallback(() => {
    if (!inputRef.current) {
      const el = document.getElementById(id) as HTMLInputElement | null;
      if (el) inputRef.current = el;
    }
    if (!isFocused) inputRef.current?.focus();
  }, [isFocused, id]);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent | React.TouchEvent, initialValue: number, delta: number) => {
      event.stopPropagation();
      event.preventDefault();
      focusInputIfNeeded();
      let nextValue = clamp(initialValue + delta);
      const absDelta = Math.abs(delta);
      handleChange(event, toRawValue(nextValue), toRawValue(initialValue), toValue);

      timeoutRef.current = setTimeout(() => {
        if (timeoutRef.current) {
          intervalRef.current = setInterval(() => {
            const rect = boxRef.current.getBoundingClientRect();
            const centerY = rect.top + rect.height / 2;
            const stepDir = centerY > mouseYRef.current ? absDelta : -absDelta;
            const previousValue = nextValue;
            nextValue = clamp(nextValue + stepDir);
            handleChange(event, toRawValue(nextValue), toRawValue(previousValue), toValue);
          }, 50);
        }
      }, 150);
    },
    [clamp, focusInputIfNeeded, handleChange, toRawValue, toValue]
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

  return !shouldRenderSpinner ? null : (
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
        disableElevation
        size="small"
        tabIndex={-1}
        onMouseDown={e => handleMouseDown(e, rawValue, step)}
        onTouchStart={e => handleMouseDown(e, rawValue, step)}
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
        disableElevation
        size="small"
        tabIndex={-1}
        onMouseDown={e => handleMouseDown(e, rawValue, -step)}
        onTouchStart={e => handleMouseDown(e, rawValue, -step)}
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

NumericalSpinnerInputAdornment.displayName = 'NumericalSpinnerInputAdornment';

export const PasswordInputAdornment = React.memo(({ variant = 'icon' }: InputButtonAdornmentProps) => {
  const { t } = useTranslation('inputs');
  const theme = useTheme();

  const [get, setStore] = usePropStore<InputControllerProps>();

  const disabled = get('disabled');
  const id = useInputId();
  const isPasswordVisible = get('isPasswordVisible');
  const passwordAdornmentProps = get('slotProps')?.passwordAdornment;
  const shouldRenderPassword = useShouldRenderPassword();
  const tiny = get('tiny');

  if (!shouldRenderPassword) return null;
  else if (variant === 'icon')
    return (
      <IconButton
        id={`${id}-password-adornment`}
        color="secondary"
        disabled={disabled}
        tabIndex={-1}
        tooltip={isPasswordVisible ? t('adornment.showPassword.tooltip') : t('adornment.hidePassword.tooltip')}
        tooltipProps={{ arrow: true }}
        type="button"
        onClick={event => {
          event.preventDefault();
          event.stopPropagation();
          setStore({ isPasswordVisible: !isPasswordVisible });
        }}
        {...passwordAdornmentProps}
        sx={{
          padding: tiny ? theme.spacing(0.25) : theme.spacing(0.5),
          ...passwordAdornmentProps?.sx
        }}
      >
        {isPasswordVisible ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
      </IconButton>
    );
  else if (variant === 'text')
    return (
      <Button
        id={`${id}-password-adornment`}
        color="secondary"
        disabled={disabled}
        disableElevation
        size="small"
        tabIndex={-1}
        type="button"
        variant="outlined"
        onClick={event => {
          event.preventDefault();
          event.stopPropagation();
          setStore({ isPasswordVisible: !isPasswordVisible });
        }}
        {...(passwordAdornmentProps as ButtonProps)}
        sx={{
          ...(tiny && { padding: 0 }),
          ...passwordAdornmentProps?.sx
        }}
      >
        {isPasswordVisible ? t('adornment.showPassword.text') : t('adornment.hidePassword.text')}
      </Button>
    );
  else return null;
});

PasswordInputAdornment.displayName = 'PasswordInputAdornment';

export const ProgressInputAdornment = React.memo(() => {
  const theme = useTheme();

  const [get] = usePropStore<InputControllerProps>();

  const id = useInputId();
  const progress = get('progress');
  const progressAdornmentProps = get('slotProps')?.progressAdornment;
  const shouldRenderProgress = useShouldRenderProgress();
  const tiny = get('tiny');

  if (!shouldRenderProgress) return null;

  return (
    <Tooltip arrow title={progress}>
      <CircularProgress
        id={`${id}-password-adornment`}
        color="secondary"
        size={tiny ? '24px' : '28px'}
        {...progressAdornmentProps}
        sx={{ padding: tiny ? theme.spacing(0.25) : theme.spacing(0.5), ...progressAdornmentProps?.sx }}
      />
    </Tooltip>
  );
});

ProgressInputAdornment.displayName = 'ProgressInputAdornment';

export const ResetInputAdornment = React.memo(({ variant = 'icon' }: InputButtonAdornmentProps) => {
  const { t } = useTranslation('inputs');
  const theme = useTheme();

  const [get] = usePropStore<InputControllerProps>();

  const defaultValue = get('defaultValue');
  const disabled = get('disabled');
  const id = useInputId();
  const onReset = get('onReset');
  const resetAdornmentProps = get('slotProps')?.resetAdornment;
  const shouldRenderReset = useShouldRenderReset();
  const tiny = get('tiny');

  const handleChange = useInputChange();

  const tooltip = useMemo<React.ReactNode>(
    () =>
      defaultValue === undefined ? null : defaultValue === null ? (
        <>
          <span style={{ color: theme.palette.text.secondary }}>{t('adornment.reset.tooltip', { type: 'value' })}</span>
          <span>{'null'}</span>
        </>
      ) : (
        <>
          <span style={{ color: theme.palette.text.secondary }}>
            {t('adornment.reset.tooltip', { type: typeof defaultValue })}
          </span>
          <span>{JSON.stringify(defaultValue)}</span>
        </>
      ),
    [defaultValue, t, theme.palette.text.secondary]
  );

  if (!shouldRenderReset) return null;
  else if (variant === 'icon')
    return (
      <IconButton
        id={`${id}-reset-adornment`}
        color="secondary"
        disabled={disabled}
        tabIndex={-1}
        tooltip={tooltip}
        tooltipProps={{ arrow: true }}
        type="button"
        onClick={event => {
          event.preventDefault();
          event.stopPropagation();
          onReset ? onReset(event) : handleChange(event, defaultValue);
        }}
        {...resetAdornmentProps}
        sx={{
          padding: tiny ? theme.spacing(0.25) : theme.spacing(0.5),
          ...resetAdornmentProps?.sx
        }}
      >
        <RefreshOutlinedIcon fontSize="small" />
      </IconButton>
    );
  else if (variant === 'text')
    return (
      <Button
        id={`${id}-reset-adornment`}
        color="secondary"
        disabled={disabled}
        disableElevation
        size="small"
        tabIndex={-1}
        type="button"
        tooltip={tooltip}
        tooltipProps={{ arrow: true }}
        variant="outlined"
        onClick={event => {
          event.preventDefault();
          event.stopPropagation();
          onReset ? onReset(event) : handleChange(event, defaultValue);
        }}
        {...(resetAdornmentProps as ButtonProps)}
        sx={{
          ...(tiny && { padding: 0 }),
          ...resetAdornmentProps?.sx
        }}
      >
        {t('adornment.reset.text')}
      </Button>
    );
  else return null;
});

ResetInputAdornment.displayName = 'ResetInputAdornment';

export const InputButtonEndAdornment = React.memo(
  ({ children, preventRender = true, ...props }: Partial<InputAdornmentProps> & { preventRender?: boolean }) => {
    const theme = useTheme();

    const shouldRenderAdornments = useShouldRenderAdornments();

    return preventRender && !shouldRenderAdornments ? null : (
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
          marginLeft: '0px',
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

InputButtonEndAdornment.displayName = 'InputButtonEndAdornment';

export const InputEndAdornment = React.memo(
  ({ children, preventRender = true, ...props }: Partial<InputAdornmentProps> & { preventRender?: boolean }) => {
    const theme = useTheme();

    const shouldRenderAdornments = useShouldRenderAdornments();

    return preventRender && !shouldRenderAdornments ? null : (
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

InputEndAdornment.displayName = 'InputEndAdornment';
