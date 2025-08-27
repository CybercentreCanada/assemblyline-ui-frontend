import type { SliderProps } from '@mui/material';
import { Slider } from '@mui/material';
import {
  HelperText,
  ResetAdornment,
  StyledFormControl,
  StyledFormLabel,
  StyledInputSkeleton,
  StyledRoot
} from 'components/visual/Inputs/lib/inputs.components';
import {
  useErrorMessage,
  useInputBlur,
  useInputChange,
  useInputFocus,
  usePropID
} from 'components/visual/Inputs/lib/inputs.hook';
import type { InputProps, InputValues } from 'components/visual/Inputs/lib/inputs.model';
import { PropProvider, usePropStore } from 'components/visual/Inputs/lib/inputs.provider';
import React from 'react';

export type SliderInputProps = InputValues<number, number> &
  InputProps & {
    marks?: SliderProps['marks'];
    max?: number;
    min?: number;
    step?: SliderProps['step'];
    valueLabelDisplay?: SliderProps['valueLabelDisplay'];
    valueLabelFormat?: SliderProps['valueLabelFormat'];
  };

const WrappedSliderInput = () => {
  const [get] = usePropStore<SliderInputProps>();

  const disabled = get('disabled');
  const errorMessage = get('errorMessage');
  const id = usePropID();
  const inputValue = get('inputValue') ?? null;
  const loading = get('loading');
  const marks = get('marks');
  const max = get('max');
  const min = get('min');
  const readOnly = get('readOnly');
  const step = get('step') ?? null;
  const value = get('value');
  const valueLabelDisplay = get('valueLabelDisplay');
  const valueLabelFormat = get('valueLabelFormat');

  const handleBlur = useInputBlur<SliderInputProps>();
  const handleChange = useInputChange<SliderInputProps>();
  const handleFocus = useInputFocus<SliderInputProps>();

  useErrorMessage();

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
                  color={!disabled && errorMessage ? 'error' : 'primary'}
                  disabled={disabled || readOnly}
                  id={id}
                  marks={marks}
                  size="small"
                  step={step}
                  value={inputValue}
                  valueLabelDisplay={valueLabelDisplay}
                  valueLabelFormat={valueLabelFormat}
                  {...(min && { min: min })}
                  {...(max && { max: max })}
                  onFocus={handleFocus}
                  onBlur={e => handleBlur(e, value, value)}
                  onChange={(e, v) => handleChange(e as unknown as React.SyntheticEvent, v, v)}
                />
              </div>
              <ResetAdornment />
            </div>
            <HelperText />
          </>
        )}
      </StyledFormControl>
    </StyledRoot>
  );
};

export const SliderInput = ({ preventRender = false, value, ...props }: SliderInputProps) =>
  preventRender ? null : (
    <PropProvider<SliderInputProps>
      props={{
        inputValue: value,
        marks: false,
        max: null,
        min: null,
        preventRender: false,
        step: null,
        value,
        valueLabelDisplay: 'auto',
        valueLabelFormat: v => v,
        ...props
      }}
    >
      <WrappedSliderInput />
    </PropProvider>
  );
