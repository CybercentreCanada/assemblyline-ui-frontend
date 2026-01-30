import type { SliderProps } from '@mui/material';
import { Slider } from '@mui/material';
import { PropProvider, usePropStore } from 'components/core/PropProvider/PropProvider';
import {
  HelperText,
  ResetAdornment,
  StyledFormControl,
  StyledFormLabel,
  StyledInputSkeleton,
  StyledRoot
} from 'components/visual/Inputs/lib/inputs.components';
import {
  useInputBlur,
  useInputChange,
  useInputFocus,
  useInputId,
  useValidation
} from 'components/visual/Inputs/lib/inputs.hook';
import type { InputOptions, InputRuntimeState, InputValueModel } from 'components/visual/Inputs/lib/inputs.model';
import { DEFAULT_INPUT_CONTROLLER_PROPS } from 'components/visual/Inputs/lib/inputs.model';
import React from 'react';

export type SliderInputProps = InputValueModel<number, number> &
  InputOptions & {
    marks?: SliderProps['marks'];
    max?: number;
    min?: number;
    step?: SliderProps['step'];
    valueLabelDisplay?: SliderProps['valueLabelDisplay'];
    valueLabelFormat?: SliderProps['valueLabelFormat'];
  };

type SliderInputController = SliderInputProps & InputRuntimeState;

const WrappedSliderInput = () => {
  const [get] = usePropStore<SliderInputController>();

  const disabled = get('disabled');
  const errorMessage = get('errorMessage');
  const id = useInputId();
  const rawValue = get('rawValue') ?? null;
  const loading = get('loading');
  const marks = get('marks');
  const max = get('max');
  const min = get('min');
  const readOnly = get('readOnly');
  const step = get('step') ?? null;
  const value = get('value');
  const valueLabelDisplay = get('valueLabelDisplay');
  const valueLabelFormat = get('valueLabelFormat');

  const handleBlur = useInputBlur<number>();
  const handleChange = useInputChange<number>();
  const handleFocus = useInputFocus<number>();

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
                  value={rawValue}
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

export const SliderInput = ({ preventRender = false, value, ...props }: SliderInputProps) => {
  const { status: validationStatus, message: validationMessage } = useValidation<number>({
    value: value ?? null,
    rawValue: value ?? null,
    ...props
  });
  return preventRender ? null : (
    <PropProvider<SliderInputController>
      initialProps={DEFAULT_INPUT_CONTROLLER_PROPS as SliderInputController}
      props={{
        // errorMessage,
        rawValue: value,
        marks: false,
        max: null,
        min: null,
        preventRender: false,
        step: null,
        validationStatus,
        validationMessage,
        value,
        valueLabelDisplay: 'auto',
        valueLabelFormat: v => v,
        ...props
      }}
    >
      <WrappedSliderInput />
    </PropProvider>
  );
};
