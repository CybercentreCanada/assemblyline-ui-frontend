import type { InputProps, InputStates, InputValues } from 'components/visual/Inputs/lib/inputs.model';
import { usePropStore } from 'components/visual/Inputs/lib/inputs.provider';
import { isValidNumber, isValidValue } from 'components/visual/Inputs/lib/inputs.utils';
import { useCallback, useRef, useTransition } from 'react';
import { useTranslation } from 'react-i18next';

export const usePropLabel = () => {
  const [get] = usePropStore();

  const label = get('label');

  return label ?? '\u00A0';
};

export const usePropID = () => {
  const [get] = usePropStore();

  const id = get('id');
  const label = get('label');

  return id ?? (typeof label === 'string' ? label.toLowerCase().replaceAll(' ', '-') : '\u00A0');
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
    if (!isValidNumber(value as unknown as number, { min, max })) {
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

  const error = get('error');
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
  const onChange = get('onChange');
  const onError = get('onError');

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
  const onChange = get('onChange');
  const onError = get('onError');

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
