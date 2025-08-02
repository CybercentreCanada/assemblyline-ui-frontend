import type { InputProps, InputValues } from 'components/visual/Inputs/lib/inputs.model';
import { usePropStore } from 'components/visual/Inputs/lib/inputs.provider';
import { isValidValue } from 'components/visual/Inputs/lib/inputs.utils';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export const useDefaultError = <
  Value,
  InputValue,
  Props extends Pick<InputValues<Value, InputValue> & InputProps, 'error' | 'required'>
>({
  error = () => '',
  required = false
}: Props) => {
  const { t } = useTranslation('inputs');

  const newError = useCallback(
    (val: Value): string => {
      const err = error(val);
      if (err) return err;
      if (required && !isValidValue(val)) return t('error.required');
      return '';
    },
    [error, required, t]
  );

  return newError;
};

export const useDefaultHandlers = <Value, InputValue, Props extends InputValues<Value, InputValue> & InputProps>() => {
  const [, setStore] = usePropStore<Props>();

  const handleClick = useCallback(
    (event: React.SyntheticEvent, inputValue: InputValue, value: Value) => {
      event.preventDefault();
      event.stopPropagation();
      setStore(s => {
        const err = s.error(value);
        s.onError(err);
        if (!err) s.onChange(event, value);
        return { ...s, inputValue: inputValue, errorMsg: err };
      });
    },
    [setStore]
  );

  const handleChange = useCallback(
    (event: React.SyntheticEvent, inputValue: InputValue, value: Value) => {
      setStore(s => {
        const err = s.error(value);
        s.onError(err);
        if (!err) s.onChange(event, value);
        return { ...s, inputValue: inputValue, errorMsg: err };
      });
    },
    [setStore]
  );

  const handleFocus = useCallback(
    (event: React.FocusEvent) => {
      setStore(s => {
        s.onFocus(event);
        return {
          ...s,
          inputValue: s.value,
          focused: !s.readOnly && !s.disabled && document.activeElement === event.target
        };
      });
    },
    [setStore]
  );

  const handleBlur = useCallback(
    (event: React.FocusEvent) => {
      setStore(s => {
        s.onBlur(event);
        return { ...s, focused: false, inputValue: null };
      });
    },
    [setStore]
  );

  return { handleChange, handleClick, handleFocus, handleBlur };
};
