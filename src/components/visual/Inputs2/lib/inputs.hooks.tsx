import type {
  InputModel,
  InputStates,
  InputValues,
  ValidationStatus
} from 'components/visual/Inputs2/lib/inputs.models';
import { VALIDATION_PRIORITY } from 'components/visual/Inputs2/lib/inputs.models';
import { isValidNumber, isValidValue } from 'components/visual/Inputs2/lib/inputs.utils';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Returns the input label or a non-breaking space if undefined.
 */
export const useInputLabel = <Value, InputValue>({ label }: InputModel<Value, InputValue>): string =>
  useMemo(() => label ?? '\u00A0', [label]);

/**
 * Returns the input ID, generating one from the label if not provided.
 * IDs are normalized to lowercase, hyphenated strings.
 */
export const useInputID = <Value, InputValue>({ id, label }: InputModel<Value, InputValue>): string =>
  useMemo(() => {
    if (id) return id;
    if (typeof label === 'string' && label.trim()) {
      return label.trim().toLowerCase().replaceAll(/\s+/g, '-');
    }
    return '\u00A0';
  }, [id, label]);

/**
 * Determines whether the clear button should be rendered.
 */
export const usePreventClearRender = <Value, InputValue>({
  clearAdornment,
  disabled,
  readOnly
}: InputModel<Value, InputValue>): boolean =>
  useMemo(() => !clearAdornment || (readOnly && !disabled), [clearAdornment, readOnly, disabled]);

/**
 * Determines whether the expand icon should be rendered.
 */
export const usePreventExpandRender = <Value, InputValue>({ expand }: InputModel<Value, InputValue>): boolean =>
  useMemo(() => expand === null, [expand]);

/**
 * Determines whether the menu adornment should be rendered.
 */
export const usePreventMenuRender = <Value, InputValue>({
  disabled,
  menuAdornment,
  readOnly
}: InputModel<Value, InputValue>): boolean =>
  useMemo(() => !menuAdornment || (readOnly && !disabled), [menuAdornment, readOnly, disabled]);

/**
 * Determines whether the password toggle should be rendered.
 */
export const usePreventPasswordRender = <Value, InputValue>({
  disabled,
  loading,
  readOnly,
  password
}: InputModel<Value, InputValue>): boolean =>
  useMemo(() => loading || disabled || readOnly || !password, [loading, disabled, readOnly, password]);

/**
 * Determines whether the reset button should be rendered.
 */
export const usePreventResetRender = <Value, InputValue>({
  disabled,
  inputValue,
  loading,
  readOnly,
  reset,
  value
}: InputModel<Value, InputValue>): boolean =>
  useMemo(() => {
    const canReset = typeof reset === 'function' ? reset(value, inputValue) : reset;
    return loading || disabled || readOnly || !canReset;
  }, [disabled, inputValue, loading, readOnly, reset, value]);

/**
 * Determines whether the spinner should be rendered.
 */
export const usePreventSpinnerRender = <Value, InputValue>({
  disabled,
  spinnerAdornment,
  readOnly
}: InputModel<Value, InputValue>): boolean =>
  useMemo(() => !spinnerAdornment || (readOnly && !disabled), [spinnerAdornment, readOnly, disabled]);

export const useCoerceInput = <Value, InputValue>({ onCoerce, ...props }: InputModel<Value, InputValue>) => {
  return null;
};

export const useValidateInput = <Value, InputValue>({
  inputValue,
  max,
  min,
  required,
  validators,
  onValidate,
  ...props
}: InputModel<Value, InputValue>): ValidationStatus => {
  const { t } = useTranslation('inputs');

  // Custom validate function
  if (onValidate) {
    const result = onValidate(null, inputValue);
    if (result && result.state !== 'default') {
      return result;
    }
  }

  // In bounds
  if (typeof inputValue === 'number' && (min != null || max != null)) {
    if (!isValidNumber(inputValue as number, { min, max })) {
      if (typeof min === 'number' && typeof max === 'number') {
        return { state: 'error', message: t('error.minmax', { min, max }) };
      }
      if (typeof min === 'number') {
        return { state: 'error', message: t('error.min', { min }) };
      }
      if (typeof max === 'number') {
        return { state: 'error', message: t('error.max', { max }) };
      }
    }
  }

  // Required
  if (required && !isValidValue(inputValue)) {
    return { state: 'error', message: t('error.required') };
  }

  // Leading or trailling space
  if (typeof inputValue === 'string' && inputValue.trim() !== inputValue) {
    return { state: 'warning', message: t('warning.whitespace') };
  }

  // Nothing
  return { state: 'default', message: null };
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

export function resolveValidation(results: (ValidationStatus | null)[]): ValidationStatus {
  for (const state of VALIDATION_PRIORITY) {
    const match = results.find(r => r?.state === state);
    if (match) return match;
  }
  return { state: 'default', message: helperText };
}

/**
 *
 */
export const useInputStates = <Value, InputValue>(
  props: InputModel<Value, InputValue>
): InputStates & InputValues<Value, InputValue> => {
  const [store, setStore] = useState<{ inputValue: string } & InputStates>({ inputValue: null });

  return { ...store, setInputValue: (next: InputValue) => setStore(s => ({ ...s, inputValue: next })) };
};

export const useInputChange = <Value, InputValue>({ onChange, ...props }: InputModel<Value, InputValue>) => {
  return useCallback(() => {
    setInternalValue(v);

    const results = runValidators(v, validators);
    setValidation(getFinalValidation(results));

    onChange(e, v);
  }, []);
};

export const useInputBlur = <Value, InputValue>({ onBlur, ...props }: InputModel<Value, InputValue>) => {
  return useCallback(event => {
    // setInternalValue(v);

    // const results = runValidators(v, validators);
    // setValidation(getFinalValidation(results));

    onBlur(e, v);
  }, []);
};

export const useInputFocus = <Value, InputValue>({ onFocus, setStore, ...props }: InputModel<Value, InputValue>) => {
  return useCallback(
    (event: React.FocusEvent) => {
      onFocus(event);
      setStore(s => ({ focused: !s.readOnly && !s.disabled && document.activeElement === event.target }));
    },
    [onFocus, setStore]
  );
};
