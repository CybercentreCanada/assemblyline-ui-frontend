import { ExpandMore } from '@mui/icons-material';
import ClearIcon from '@mui/icons-material/Clear';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import type { InputAdornmentProps } from '@mui/material';
import { Button, IconButton, InputAdornment, ListItemIcon, useTheme } from '@mui/material';
import { usePropStore } from 'components/core/PropProvider/PropProvider';
import type { IconButtonProps } from 'components/visual/Buttons/IconButton';
import { useInputChange } from 'components/visual/Inputs/hooks/inputs.hook.event_handlers';
import {
  useInputId,
  useShouldRenderAdornments,
  useShouldRenderClear,
  useShouldRenderExpand,
  useShouldRenderMenu,
  useShouldRenderNumericalSpinner,
  useShouldRenderPassword,
  useShouldRenderReset
} from 'components/visual/Inputs/hooks/inputs.hook.renderer';
import type { InputControllerProps } from 'components/visual/Inputs/models/inputs.model';
import { Tooltip } from 'components/visual/Tooltip';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { LinkProps } from 'react-router-dom';

export const ClearInputAdornment = React.memo(() => {
  const theme = useTheme();

  const [get] = usePropStore<InputControllerProps<string[], string[]>>();

  const disabled = get('disabled');
  const expandProps = get('expandProps');
  const id = useInputId();
  const rawValue = get('rawValue');
  const shouldRenderClear = useShouldRenderClear();
  const tiny = get('tiny');

  const handleChange = useInputChange();

  return !shouldRenderClear ? null : (
    <ListItemIcon sx={{ minWidth: 0 }}>
      <IconButton
        aria-label={`${id}-clear`}
        color="secondary"
        disabled={disabled || !rawValue?.length}
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

ClearInputAdornment.displayName = 'ClearInputAdornment';

export const ExpandInputAdornment = React.memo(() => {
  const theme = useTheme();

  const [get] = usePropStore<InputControllerProps>();

  const expand = get('expand');
  const expandProps = get('expandProps');
  const id = useInputId();
  const onExpand = get('onExpand');
  const shouldRenderExpand = useShouldRenderExpand();

  return !shouldRenderExpand ? null : (
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

ExpandInputAdornment.displayName = 'ExpandInputAdornment';

export type HelpInputAdornmentProps = {
  to?: LinkProps['to'] | (() => LinkProps['to']);
  variant?: 'icon' | 'text';
  onClick?: IconButtonProps['onClick'];
};

export const HelpInputAdornment = React.memo(
  ({ to = null, variant = 'icon', onClick = () => null }: HelpInputAdornmentProps) => {
    const theme = useTheme();

    const [get, setStore] = usePropStore<InputControllerProps>();

    const disabled = get('disabled');
    const id = useInputId();
    const isPasswordVisible = get('isPasswordVisible');
    const resetProps = get('resetProps');
    const shouldRenderPassword = useShouldRenderPassword();
    const tiny = get('tiny');

    return variant === 'icon' ? (
      <IconButton
        aria-label={`${id}-help`}
        color="secondary"
        type="button"
        onClick={event => {
          event.preventDefault();
          event.stopPropagation();
          onClick(event);
        }}
        sx={{
          padding: tiny ? theme.spacing(0.25) : theme.spacing(0.5)
        }}
      >
        <ClearIcon fontSize="small" />
      </IconButton>
    ) : null;
  }
);

HelpInputAdornment.displayName = 'HelpInputAdornment';

export const MenuInputAdornment = React.memo(() => {
  const theme = useTheme();

  const [get, setStore] = usePropStore<InputControllerProps>();

  const disabled = get('disabled');
  const id = useInputId();
  const isMenuOpen = get('isMenuOpen');
  const resetProps = get('resetProps');
  const shouldRenderMenu = useShouldRenderMenu();
  const tiny = get('tiny');

  return !shouldRenderMenu ? null : (
    <IconButton
      aria-label={`${id}-select-menu`}
      color="secondary"
      disabled={disabled}
      type="button"
      tabIndex={-1}
      onClick={() => setStore({ isMenuOpen: true })}
      {...resetProps}
      sx={{
        padding: tiny ? theme.spacing(0.75) : theme.spacing(1),
        transition: theme.transitions.create('transform', {
          duration: theme.transitions.duration.shortest
        }),
        transform: isMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        ...resetProps?.sx
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M0 8 L12 20 L24 8 Z" />
      </svg>
    </IconButton>
  );
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

export const PasswordInputAdornment = React.memo(() => {
  const theme = useTheme();

  const [get, setStore] = usePropStore<InputControllerProps>();

  const disabled = get('disabled');
  const id = useInputId();
  const isPasswordVisible = get('isPasswordVisible');
  const resetProps = get('resetProps');
  const shouldRenderPassword = useShouldRenderPassword();
  const tiny = get('tiny');

  return !shouldRenderPassword ? null : (
    <IconButton
      aria-label={`${id}-password`}
      color="secondary"
      disabled={disabled}
      type="button"
      onClick={() => setStore(s => ({ isPasswordVisible: !s.isPasswordVisible }))}
      {...resetProps}
      sx={{
        padding: tiny ? theme.spacing(0.25) : theme.spacing(0.5),
        ...resetProps?.sx
      }}
    >
      {isPasswordVisible ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
    </IconButton>
  );
});

PasswordInputAdornment.displayName = 'PasswordInputAdornment';

export const ResetInputAdornment = React.memo(() => {
  const { t } = useTranslation('inputs');
  const theme = useTheme();

  const [get] = usePropStore<InputControllerProps>();

  const defaultValue = get('defaultValue');
  const disabled = get('disabled');
  const id = useInputId();
  const onReset = get('onReset');
  const resetProps = get('resetProps');
  const shouldRenderReset = useShouldRenderReset();
  const tiny = get('tiny');

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

  return !shouldRenderReset ? null : (
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
