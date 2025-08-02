import {
  HelperText,
  StyledFormControl,
  StyledFormLabel,
  StyledInputSkeleton,
  StyledRoot,
  StyledTextField
} from 'components/visual/Inputs/lib/inputs.components';
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

const WrappedNumberInput = () => {
  const [get, setStore] = usePropStore<NumberInputProps>();

  const inputValue = get(s => s.inputValue);
  const loading = get(s => s.loading);
  const password = get(s => s.password);
  const tiny = get(s => s.tiny);
  const value = get(s => s.value);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setStore(s => {
        const newValue = event.target.value;
        const num = newValue !== '' ? Number(newValue) : null;
        const err = s.error(num);
        s.onError(err);
        if (!err) s.onChange(event, num);
        return { ...s, inputValue: newValue, errorMsg: err };
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
          inputValue: s.value !== null && s.value !== undefined ? String(s.value) : '',
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

  return (
    <StyledRoot>
      <StyledFormLabel />
      <StyledFormControl>
        {loading ? (
          <StyledInputSkeleton />
        ) : (
          <>
            <StyledTextField
              type={password ? 'password' : 'number'}
              value={inputValue ?? (value !== null ? String(value) : '')}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              slotProps={{
                input: {
                  inputProps: {
                    // ...(typeof min === 'number' && { min }),
                    // ...(typeof max === 'number' && { max }),
                    ...(tiny && { sx: { padding: '2.5px 4px 2.5px 8px' } })
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
};

export const NumberInput: React.FC<NumberInputProps> = React.memo(
  ({ error = () => '', max = null, min = null, preventRender = false, value, ...props }) => {
    const { t } = useTranslation('inputs');

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
      <PropProvider<NumberInputProps> data={{ ...props, error: newError, errorMsg: newError(value), max, min, value }}>
        <WrappedNumberInput />
      </PropProvider>
    );
  }
);
