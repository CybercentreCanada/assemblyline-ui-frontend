import {
  HelperText,
  StyledFormControl,
  StyledFormLabel,
  StyledInputSkeleton,
  StyledRoot,
  StyledTextField
} from 'components/visual/Inputs/lib/inputs.components';
import { useInputParsedProps } from 'components/visual/Inputs/lib/inputs.hook';
import type { InputProps, InputValues } from 'components/visual/Inputs/lib/inputs.model';
import { PropProvider, usePropStore } from 'components/visual/Inputs/lib/inputs.provider';
import { isValidNumber, isValidValue } from 'components/visual/Inputs/lib/inputs.utils';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export type NumberInputProps = InputValues<number, string> &
  InputProps & {
    max?: number;
    min?: number;
  };

const WrappedNumberInput = React.memo(() => {
  const [get, setStore] = usePropStore<NumberInputProps>();

  const inputValue = get('inputValue');
  const loading = get('loading');
  const password = get('password');
  const showPassword = get('showPassword');
  const tiny = get('tiny');

  const error = get('error');
  const onBlur = get('onBlur');
  const onChange = get('onChange');
  const onError = get('onError');
  const onFocus = get('onFocus');

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = event.target.value;
      const num = newValue !== '' ? Number(newValue) : null;
      const err = error(num);
      onError(err);
      if (!err) onChange(event, num);
      setStore(() => ({ ...(!err && { value: num }), inputValue: newValue, errorMsg: err }));
    },
    [error, onChange, onError, setStore]
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
    (event: React.FocusEvent) => {
      onBlur(event);
      setStore(s => {
        const newInputValue = s.value !== null ? String(s.value) : '';
        const err = error(s.value);
        return { focused: false, inputValue: newInputValue, errorMsg: err };
      });
    },
    [error, onBlur, setStore]
  );

  return (
    <StyledRoot>
      <StyledFormLabel />
      <StyledFormControl>
        {loading ? (
          <StyledInputSkeleton />
        ) : (
          <>
            <StyledTextField
              type={password && showPassword ? 'password' : 'number'}
              value={inputValue}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              slotProps={{
                input: {
                  style: {
                    // ...(typeof min === 'number' && { min }),
                    // ...(typeof max === 'number' && { max }),
                    ...(tiny && { padding: '2.5px 4px 2.5px 8px' })
                  }
                }
              }}
            />
            <HelperText />
          </>
        )}
      </StyledFormControl>
    </StyledRoot>
  );
});

export const NumberInput = ({
  error = () => '',
  max = null,
  min = null,
  preventRender = false,
  value,
  ...props
}: NumberInputProps) => {
  const { t } = useTranslation('inputs');

  const parsedProps = useInputParsedProps({ ...props, error, max, min, preventRender, value });

  const newError = useCallback(
    (val: number): string => {
      const err = error(val);
      if (err) return err;
      if (props.required && !isValidValue(val)) return t('error.required');
      if (!isValidNumber(val, { min, max })) {
        if (typeof min === 'number' && typeof max === 'number') return t('error.minmax', { min, max });
        if (typeof min === 'number') return t('error.min', { min });
        if (typeof max === 'number') return t('error.max', { max });
      }
      return '';
    },
    [error, props.required, t, min, max]
  );

  return preventRender ? null : (
    <PropProvider<NumberInputProps>
      props={{
        ...parsedProps,
        error: newError,
        errorMsg: newError(value),
        inputValue: value !== null ? String(value) : ''
      }}
    >
      <WrappedNumberInput />
    </PropProvider>
  );
};
