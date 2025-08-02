import { FormControl, Slider } from '@mui/material';
import {
  HelperText,
  ResetInput,
  StyledFormLabel,
  StyledInputSkeleton,
  StyledRoot
} from 'components/visual/Inputs/lib/inputs.components';
import { useDefaultHandlers } from 'components/visual/Inputs/lib/inputs.hook';
import type { InputProps, InputValues } from 'components/visual/Inputs/lib/inputs.model';
import { PropProvider, usePropStore } from 'components/visual/Inputs/lib/inputs.provider';
import { isValidNumber, isValidValue } from 'components/visual/Inputs/lib/inputs.utils';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export type SliderInputProps = InputValues<number> &
  InputProps & {
    min?: number;
    max?: number;
  };

const WrappedSliderInput = () => {
  const [get] = usePropStore<SliderInputProps>();

  const disabled = get(s => s.disabled);
  const errorMsg = get(s => s.errorMsg);
  const id = get(s => s.id);
  const inputValue = get(s => s.inputValue);
  const loading = get(s => s.loading);
  const max = get(s => s.max);
  const min = get(s => s.min);
  const readOnly = get(s => s.readOnly);
  const value = get(s => s.value);

  const { handleChange, handleFocus, handleBlur } = useDefaultHandlers();

  return (
    <StyledRoot>
      <StyledFormLabel />
      <FormControl fullWidth error={!!errorMsg}>
        {loading ? (
          <StyledInputSkeleton />
        ) : (
          <>
            <div style={{ minHeight: '40px', display: 'flex', alignItems: 'center' }}>
              <div style={{ flex: 1, marginLeft: '20px', marginRight: '20px' }}>
                <Slider
                  id={id}
                  value={inputValue ?? value ?? 0}
                  min={min}
                  max={max}
                  disabled={disabled || readOnly}
                  size="small"
                  valueLabelDisplay="auto"
                  color={!disabled && errorMsg ? 'error' : 'primary'}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  onChange={(e, v) => handleChange(e as unknown as React.SyntheticEvent, v, v)}
                />
              </div>
              <ResetInput onChange={(e, v) => handleChange(e, v, v)} />
            </div>
            <HelperText />
          </>
        )}
      </FormControl>
    </StyledRoot>
  );
};

export const SliderInput: React.FC<SliderInputProps> = React.memo(
  ({ error = () => '', min, max, preventRender = false, required = false, value, ...props }) => {
    const { t } = useTranslation('inputs');

    const newError = useCallback(
      (val: number): string => {
        const err = error(val);
        if (err) return err;
        if (required && !isValidValue(val)) return t('error.required');
        if (!isValidNumber(val, { min, max })) {
          if (typeof min === 'number' && typeof max === 'number') return t('error.minmax', { min, max });
          if (typeof min === 'number') return t('error.min', { min });
          if (typeof max === 'number') return t('error.max', { max });
        }
        return '';
      },
      [error, required, min, max, t]
    );

    return preventRender ? null : (
      <PropProvider<SliderInputProps>
        data={{
          ...props,
          error: newError,
          errorMsg: newError(value),
          max,
          min,
          required,
          value
        }}
      >
        <WrappedSliderInput />
      </PropProvider>
    );
  }
);
