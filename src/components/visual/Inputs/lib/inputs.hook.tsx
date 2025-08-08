import type { InputProps, InputStates, InputValues } from 'components/visual/Inputs/lib/inputs.model';
import { DEFAULT_INPUT_PROPS, DEFAULT_INPUT_STATES } from 'components/visual/Inputs/lib/inputs.model';
import { usePropStore } from 'components/visual/Inputs/lib/inputs.provider';
import { isValidNumber, isValidValue } from 'components/visual/Inputs/lib/inputs.utils';
import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export const useDefaultError = () => null;

export const useDefaultHandlers = () => ({
  handleClick: () => null,
  handleChange: () => null,
  handleFocus: () => null,
  handleBlur: () => null
});

export function useInputParsedProps<
  Value,
  InputValue,
  Props extends InputValues<Value, InputValue> & InputProps & { min?: number; max?: number }
>(props: Props) {
  const { t } = useTranslation('inputs');

  const mergedProps = { ...DEFAULT_INPUT_PROPS, ...DEFAULT_INPUT_STATES, ...props };
  const { min, max, required, error = () => '' } = mergedProps;

  const validateError = useCallback(
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

  return {
    ...props,
    error: validateError,
    errorMsg: validateError(mergedProps.value),
    id:
      mergedProps.id ??
      (typeof mergedProps.label === 'string' ? mergedProps.label.toLowerCase().replaceAll(' ', '-') : '\u00A0'),
    inputValue: mergedProps.value,
    label: mergedProps.label ?? '\u00A0',
    preventExpandRender: mergedProps.expand === null,
    preventPasswordRender: mergedProps.loading || mergedProps.disabled || mergedProps.readOnly || !mergedProps.password,
    preventResetRender: mergedProps.loading || mergedProps.disabled || mergedProps.readOnly || !mergedProps.reset
  };
}

export function useInputHandlers<
  Props extends InputValues<unknown, unknown> & InputProps & InputStates & Record<string, unknown>
>(debounceDelay = 100) {
  const [get, setStore] = usePropStore<InputValues<unknown, unknown>>();
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const error = get('error');
  const onBlur = get('onBlur');
  const onChange = get('onChange');
  const onError = get('onError');
  const onFocus = get('onFocus');

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const handleClick = useCallback(
    (event: Parameters<Props['onChange']>[0], inputValue: Props['inputValue'], value: Props['value']) => {
      event.preventDefault();
      event.stopPropagation();

      const err = error(value);
      onError(err);
      if (!err) onChange(event, value);
      setStore(() => ({ inputValue, errorMsg: err }));
    },
    [error, onChange, onError, setStore]
  );

  const handleChange = useCallback(
    (event: Parameters<Props['onChange']>[0], inputValue: Props['inputValue'], value: Props['value']) => {
      const err = error(value);
      onError(err);

      setStore(() => ({ ...(!err && { value }), inputValue, errorMsg: err }));

      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      debounceTimer.current = setTimeout(() => {
        if (!err) onChange(event, value);
      }, debounceDelay);
    },
    [error, onChange, onError, setStore, debounceDelay]
  );

  const handleFocus = useCallback(
    (event: React.FocusEvent) => {
      onFocus(event);
      setStore(s => ({
        focused: !s.readOnly && !s.disabled && document.activeElement === event.target
      }));
    },
    [onFocus, setStore]
  );

  const handleBlur = useCallback(
    (event: React.FocusEvent, inputValue: Props['inputValue']) => {
      onBlur(event);
      setStore(() => {
        const err = error(inputValue);
        return { focused: false, inputValue, errorMsg: err };
      });
    },
    [error, onBlur, setStore]
  );

  return { handleChange, handleClick, handleFocus, handleBlur };
}
