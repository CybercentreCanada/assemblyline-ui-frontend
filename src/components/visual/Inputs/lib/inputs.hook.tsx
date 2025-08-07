import type { InputProps, InputStates, InputValues } from 'components/visual/Inputs/lib/inputs.model';
import { DEFAULT_INPUT_PROPS, DEFAULT_INPUT_STATES } from 'components/visual/Inputs/lib/inputs.model';
import { usePropStore } from 'components/visual/Inputs/lib/inputs.provider';
import { isValidValue } from 'components/visual/Inputs/lib/inputs.utils';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export const useDefaultError = () => null;

export const useDefaultHandlers = () => ({
  handleClick: () => null,
  handleChange: () => null,
  handleFocus: () => null,
  handleBlur: () => null
});

export const useInputParsedProps = <Value, InputValue, Props extends InputValues<Value, InputValue> & InputProps>({
  error = () => '',
  ...props
}: Props) => {
  const { t } = useTranslation('inputs');

  const parsedProps = { ...DEFAULT_INPUT_PROPS, ...DEFAULT_INPUT_STATES, ...props };

  const newError = useCallback(
    (val: Value, min: number = null, max: number = null): string => {
      const err = error(val);
      if (err) return err;
      if (parsedProps.required && !isValidValue(val)) return t('error.required');
      if (typeof val === 'number') {
        if (typeof min === 'number' && typeof max === 'number') return t('error.minmax', { min, max });
        if (typeof min === 'number') return t('error.min', { min });
        if (typeof max === 'number') return t('error.max', { max });
      }
      return '';
    },
    [error, parsedProps.required, t]
  );

  return {
    ...props,
    error: newError,
    errorMsg: newError(parsedProps.value),
    id: (parsedProps.id || (parsedProps.label ?? '\u00A0')).toLowerCase().replaceAll(' ', '-'),
    inputValue: parsedProps.value,
    label: parsedProps.label ?? '\u00A0',
    preventExpandRender: parsedProps.expand === null,
    preventPasswordRender: parsedProps.loading || parsedProps.disabled || parsedProps.readOnly || !parsedProps.password,
    preventResetRender: parsedProps.loading || parsedProps.disabled || parsedProps.readOnly || !parsedProps.reset
  };
};

export const useInputHandlers = <
  Props extends InputValues<unknown, unknown> & InputProps & InputStates & Record<string, unknown>
>() => {
  const [get, setStore] = usePropStore<InputValues<unknown, unknown>>();

  const error = get('error');
  const onBlur = get('onBlur');
  const onChange = get('onChange');
  const onError = get('onError');
  const onFocus = get('onFocus');

  const handleClick = useCallback(
    (event: React.SyntheticEvent, inputValue: Props['inputValue'], value: Props['value']) => {
      event.preventDefault();
      event.stopPropagation();

      const err = error(value);
      onError(err);
      if (!err) onChange(event, value);
      setStore(() => ({ inputValue: inputValue, errorMsg: err }));
    },
    [error, onChange, onError, setStore]
  );

  const handleChange = useCallback(
    (event: React.SyntheticEvent, inputValue: Props['inputValue'], value: Props['value']) => {
      const err = error(value);
      onError(err);
      if (!err) onChange(event, value);
      setStore(() => ({ ...(!err && { value: value }), inputValue: inputValue, errorMsg: err }));
    },
    [error, onChange, onError, setStore]
  );

  const handleFocus = useCallback(
    (event: React.FocusEvent) => {
      onFocus(event);
      setStore(s => ({
        // inputValue: s.value,
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
        return { focused: false, inputValue: inputValue, errorMsg: err };
      });
    },
    [error, onBlur, setStore]
  );

  return { handleChange, handleClick, handleFocus, handleBlur };
};
