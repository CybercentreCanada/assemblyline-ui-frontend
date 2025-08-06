import { Slider } from '@mui/material';
import {
  HelperText,
  ResetInput,
  StyledFormControl,
  StyledFormLabel,
  StyledInputSkeleton,
  StyledRoot
} from 'components/visual/Inputs/lib/inputs.components';
import { useInputHandlers, useInputParsedProps } from 'components/visual/Inputs/lib/inputs.hook';
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

const WrappedSliderInput = React.memo(() => {
  const [get] = usePropStore<SliderInputProps>();

  const disabled = get('disabled');
  const errorMsg = get('errorMsg');
  const id = get('id');
  const inputValue = get('inputValue');
  const loading = get('loading');
  const max = get('max');
  const min = get('min');
  const readOnly = get('readOnly');

  const { handleChange, handleFocus, handleBlur } = useInputHandlers<SliderInputProps>();

  return (
    <StyledRoot>
      <StyledFormLabel />
      <StyledFormControl>
        {loading ? (
          <StyledInputSkeleton />
        ) : (
          <>
            <div style={{ minHeight: '40px', display: 'flex', alignItems: 'center' }}>
              <div style={{ flex: 1, marginLeft: '20px', marginRight: '20px' }}>
                <Slider
                  aria-label={id}
                  id={id}
                  value={inputValue}
                  {...(min && { min: min })}
                  {...(max && { max: max })}
                  disabled={disabled || readOnly}
                  size="small"
                  valueLabelDisplay="auto"
                  color={!disabled && errorMsg ? 'error' : 'primary'}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  onChange={(e, v) => handleChange(e as unknown as React.SyntheticEvent, v, v)}
                />
              </div>
              <ResetInput />
            </div>
            <HelperText />
          </>
        )}
      </StyledFormControl>
    </StyledRoot>
  );
});

export const SliderInput = ({
  error = () => '',
  min = null,
  max = null,
  preventRender = false,
  required = false,
  value,
  ...props
}: SliderInputProps) => {
  const { t } = useTranslation('inputs');

  const parsedProps = useInputParsedProps({ ...props, error, max, min, preventRender, required, value });

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
    <PropProvider<SliderInputProps> props={{ ...parsedProps, error: newError, errorMsg: newError(value) }}>
      <WrappedSliderInput />
    </PropProvider>
  );
};
