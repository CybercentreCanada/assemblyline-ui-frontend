import type { TextFieldProps } from '@mui/material';
import { PropProvider, usePropStore } from 'components/core/PropProvider/PropProvider';
import {
  HelperText,
  StyledFormControl,
  StyledFormLabel,
  StyledInputSkeleton,
  StyledRoot,
  StyledTextField
} from 'components/visual/Inputs/lib/inputs.components';
import { useInputBlur, useInputChange, useInputFocus, useValidation } from 'components/visual/Inputs/lib/inputs.hook';
import type { InputOptions, InputRuntimeState, InputValueModel } from 'components/visual/Inputs/lib/inputs.model';
import { DEFAULT_INPUT_CONTROLLER_PROPS } from 'components/visual/Inputs/lib/inputs.model';
import React, { useEffect, useRef } from 'react';

export type NumberInputProps = InputValueModel<
  number,
  string,
  React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
> &
  InputOptions & {
    autoComplete?: TextFieldProps['autoComplete'];
    max?: number;
    min?: number;
    step?: number;
  };

type NumberInputController = NumberInputProps & InputRuntimeState;

const WrappedNumberInput = () => {
  const [get] = usePropStore<NumberInputController>();

  const rawValue = get('rawValue') ?? '';
  const loading = get('loading');
  const max = get('max');
  const min = get('min');
  const step = get('step');
  const value = get('value');

  const inputRef = useRef<HTMLInputElement>(null);

  const handleBlur = useInputBlur<number, string>();
  const handleChange = useInputChange<number, string>();
  const handleFocus = useInputFocus<number, string>();

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (document.activeElement === el) {
        e.preventDefault();
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, [inputRef]);

  return (
    <StyledRoot>
      <StyledFormLabel />
      <StyledFormControl>
        {loading ? (
          <StyledInputSkeleton />
        ) : (
          <>
            <StyledTextField
              ref={inputRef}
              type="number"
              value={rawValue}
              onChange={e => handleChange(e, e.target.value !== '' ? Number(e.target.value) : null, e.target.value)}
              onFocus={handleFocus}
              onBlur={e => handleBlur(e, value, value == null ? '' : String(value))}
              slotProps={{
                input: {
                  inputProps: {
                    ...(typeof max === 'number' && { max }),
                    ...(typeof min === 'number' && { min }),
                    ...(typeof step === 'number' && { step })
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

export const NumberInput = ({ preventRender = false, value, ...props }: NumberInputProps) => {
  const { status: validationStatus, message: validationMessage } = useValidation<number, string>({
    value: value,
    rawValue: String(value),
    ...props
  });

  return preventRender ? null : (
    <PropProvider<NumberInputController>
      initialProps={DEFAULT_INPUT_CONTROLLER_PROPS as NumberInputController}
      props={{
        autoComplete: 'off',
        rawValue: value == null ? '' : String(value),
        max: null,
        min: null,
        preventRender,
        showSpinner: true,
        validationStatus,
        validationMessage,
        step: 1,
        value,
        ...props
      }}
    >
      <WrappedNumberInput />
    </PropProvider>
  );
};
