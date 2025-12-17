import type { TextFieldProps } from '@mui/material';
import { InputAdornment, useTheme } from '@mui/material';
import type { InputProps, InputStates, InputValues } from 'components/visual/Inputs/lib/inputs.model';
import { isValidNumber, isValidValue } from 'components/visual/Inputs/lib/inputs.utils';
import { usePropStore } from 'components/visual/ListInputs/lib/listinputs.provider';
import React, { useCallback, useMemo, useRef, useTransition } from 'react';
import { useTranslation } from 'react-i18next';

export const usePropLabel = () => {
  const [get] = usePropStore();

  const primary = get('primary');

  return primary ?? '\u00A0';
};

export const usePropID = () => {
  const [get] = usePropStore();

  const id = get('id');
  const primary = get('primary');

  return id ?? (typeof primary === 'string' ? primary.toLowerCase().replaceAll(' ', '-') : '\u00A0');
};

export const usePreventClearRender = () => {
  const [get] = usePropStore();

  const clearAdornment = get('clearAdornment');
  const disabled = get('disabled');
  const readOnly = get('readOnly');

  return !clearAdornment || (readOnly && !disabled);
};

export const usePreventExpandRender = () => {
  const [get] = usePropStore();

  const expand = get('expand');

  return expand === null;
};

export const usePreventMenuRender = () => {
  const [get] = usePropStore();

  const disabled = get('disabled');
  const menuAdornment = get('menuAdornment');
  const readOnly = get('readOnly');

  return !menuAdornment || (readOnly && !disabled);
};

export const usePreventPasswordRender = () => {
  const [get] = usePropStore();

  const disabled = get('disabled');
  const loading = get('loading');
  const readOnly = get('readOnly');
  const password = get('password');

  return loading || disabled || readOnly || !password;
};

export const usePreventResetRender = () => {
  const [get] = usePropStore<InputValues<unknown, unknown>>();

  const disabled = get('disabled');
  const inputValue = get('inputValue');
  const loading = get('loading');
  const readOnly = get('readOnly');
  const reset = get('reset');
  const value = get('value');

  return loading || disabled || readOnly || !(typeof reset === 'function' ? reset(value, inputValue) : reset);
};

export const usePreventSpinnerRender = () => {
  const [get] = usePropStore();

  const disabled = get('disabled');
  const spinnerAdornment = get('spinnerAdornment');
  const readOnly = get('readOnly');

  return !spinnerAdornment || (readOnly && !disabled);
};

export const useErrorCallback = <
  Props extends InputValues<unknown, unknown> & InputProps & InputStates & Record<string, unknown>
>({
  error = () => null,
  value = null,
  min = null,
  max = null,
  required = false
}: Props & { min?: number; max?: number }) => {
  const { t } = useTranslation('inputs');

  const err = error(value);
  if (err) return err;

  if (required && (min != null || max != null)) {
    if (!isValidNumber(value as number, { min, max })) {
      if (typeof min === 'number' && typeof max === 'number') return t('error.minmax', { min, max });
      if (typeof min === 'number') return t('error.min', { min });
      if (typeof max === 'number') return t('error.max', { max });
    }
  }

  if (required && !isValidValue(value)) {
    return t('error.required');
  }

  return '';
};

export const useError = <Value extends unknown = unknown>() => {
  const { t } = useTranslation('inputs');
  const [get] = usePropStore<InputValues<unknown, unknown> & { min?: number; max?: number }>();

  const error = get('error') || (() => null);
  const max = get('max');
  const min = get('min');
  const required = get('required');

  return useCallback(
    (val: Value): string => {
      const err = error(val);
      if (err) return err;

      if (required && (min != null || max != null)) {
        if (!isValidNumber(val as unknown as number, { min, max })) {
          if (typeof min === 'number' && typeof max === 'number') return t('error.minmax', { min, max });
          if (typeof min === 'number') return t('error.min', { min });
          if (typeof max === 'number') return t('error.max', { max });
        }
      }

      if (required && !isValidValue(val)) {
        return t('error.required');
      }

      return '';
    },
    [error, min, max, required, t]
  );
};

export const useInputClick = <
  Props extends InputValues<unknown, unknown> & InputProps & InputStates & Record<string, unknown>
>() => {
  const [get, setStore] = usePropStore<InputValues<unknown, unknown>>();

  const [, startTransition] = useTransition();
  const latestId = useRef<number>(0);

  const error = useError();
  const enforceValidValue = get('enforceValidValue');
  const onChange = get('onChange') || (() => null);
  const onError = get('onError') || (() => null);

  return useCallback(
    (event: Parameters<Props['onChange']>[0], inputValue: Props['inputValue'], value: Props['value']) => {
      event.preventDefault();
      event.stopPropagation();

      const errorMessage = error(value);
      onError(errorMessage);
      setStore({ inputValue, errorMessage });

      const id = ++latestId.current;

      startTransition(() => {
        if (id === latestId.current && (!enforceValidValue || !errorMessage)) {
          setStore({ value });
          onChange(event, value);
        }
      });
    },
    [enforceValidValue, error, onChange, onError, setStore]
  );
};

export const useInputChange = <
  Props extends InputValues<unknown, unknown> & InputProps & InputStates & Record<string, unknown>
>() => {
  const [get, setStore] = usePropStore<InputValues<unknown, unknown>>();

  const [, startTransition] = useTransition();
  const latestId = useRef<number>(0);

  const error = useError();
  const enforceValidValue = get('enforceValidValue');
  const onChange = get('onChange') || (() => null);
  const onError = get('onError') || (() => null);

  return useCallback(
    (event: Parameters<Props['onChange']>[0], inputValue: Props['inputValue'], value: Props['value']) => {
      const errorMessage = error(value);
      onError(errorMessage);
      setStore({ inputValue, errorMessage });

      const id = ++latestId.current;

      startTransition(() => {
        if (id === latestId.current && (!enforceValidValue || !errorMessage)) {
          setStore({ value });
          onChange(event, value);
        }
      });
    },
    [enforceValidValue, error, onChange, onError, setStore]
  );
};

export const useInputFocus = <
  Props extends InputValues<unknown, unknown> & InputProps & InputStates & Record<string, unknown>
>() => {
  const [get, setStore] = usePropStore<InputValues<unknown, unknown>>();

  const onFocus = get('onFocus');

  return useCallback(
    (event: React.FocusEvent) => {
      onFocus(event);
      setStore(s => ({ focused: !s.readOnly && !s.disabled && document.activeElement === event.target }));
    },
    [onFocus, setStore]
  );
};

export const useInputBlur = <
  Props extends InputValues<unknown, unknown> & InputProps & InputStates & Record<string, unknown>
>() => {
  const [get, setStore] = usePropStore();

  const handleChange = useInputChange();
  const onBlur = get('onBlur');

  return useCallback(
    (event: React.FocusEvent, inputValue: Props['inputValue'], value: Props['value']) => {
      onBlur(event);
      setStore(() => ({ focused: false }));
      handleChange(event, inputValue, value);
    },
    [handleChange, onBlur, setStore]
  );
};

export const useInputClickBlur = <
  Props extends InputValues<unknown, unknown> & InputProps & InputStates & Record<string, unknown>
>() => {
  const [get, setStore] = usePropStore();

  const error = useError();
  const onBlur = get('onBlur');

  return useCallback(
    (event: React.FocusEvent, inputValue: Props['inputValue'], value: Props['value']) => {
      onBlur(event);

      const errorMessage = error(value);
      setStore(() => ({ focused: false, errorMessage, inputValue, value }));
    },
    [error, onBlur, setStore]
  );
};

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
      // 'aria-label': label,
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
