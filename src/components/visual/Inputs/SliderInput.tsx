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
import React from 'react';

export type SliderInputProps = InputValues<number, number> &
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
  const value = get('value');

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
                  onBlur={e => handleBlur(e, value)}
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

export const SliderInput = ({ min = null, max = null, preventRender = false, value, ...props }: SliderInputProps) => {
  const parsedProps = useInputParsedProps<number, number, SliderInputProps>({
    ...props,
    max,
    min,
    preventRender,
    value
  });

  return preventRender ? null : (
    <PropProvider<SliderInputProps> props={{ ...parsedProps }}>
      <WrappedSliderInput />
    </PropProvider>
  );
};
