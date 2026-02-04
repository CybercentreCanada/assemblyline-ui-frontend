import type { SliderProps } from '@mui/material';
import { Slider } from '@mui/material';
import { PropProvider, usePropStore } from 'components/core/PropProvider/PropProvider';
import { ResetInputAdornment } from 'components/visual/Inputs/components/inputs.component.adornment';
import {
  InputFormControl,
  InputFormLabel,
  InputHelperText,
  InputRoot,
  InputSkeleton
} from 'components/visual/Inputs/components/inputs.component.form';
import { useInputBlur, useInputChange, useInputFocus } from 'components/visual/Inputs/hooks/inputs.hook.event_handlers';
import { useInputId } from 'components/visual/Inputs/hooks/inputs.hook.renderer';
import { useInputValidation } from 'components/visual/Inputs/hooks/inputs.hook.validation';
import type {
  InputOptions,
  InputRuntimeState,
  InputSlotProps,
  InputValueModel
} from 'components/visual/Inputs/models/inputs.model';
import { DEFAULT_INPUT_CONTROLLER_PROPS } from 'components/visual/Inputs/models/inputs.model';
import React from 'react';

export type SliderInputProps = InputValueModel<number, number> &
  InputOptions &
  InputSlotProps & {
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
  const validationStatus = get('validationStatus');

  const handleBlur = useInputBlur<number>();
  const handleChange = useInputChange<number>();
  const handleFocus = useInputFocus<number>();

  return (
    <InputRoot>
      <InputFormLabel />
      <InputFormControl>
        {loading ? (
          <InputSkeleton />
        ) : (
          <>
            <div style={{ minHeight: '40px', display: 'flex', alignItems: 'center' }}>
              <div style={{ flex: 1, marginLeft: '20px', marginRight: '20px' }}>
                <Slider
                  aria-label={id}
                  color={!disabled && validationStatus === 'error' ? 'error' : 'primary'}
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
              <ResetInputAdornment />
            </div>
            <InputHelperText />
          </>
        )}
      </InputFormControl>
    </InputRoot>
  );
};

export const SliderInput = ({ preventRender = false, value, ...props }: SliderInputProps) => {
  const { status: validationStatus, message: validationMessage } = useInputValidation<number>({
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
