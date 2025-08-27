import type { TextFieldProps } from '@mui/material';
import {
  HelperText,
  StyledFormControl,
  StyledFormLabel,
  StyledInputSkeleton,
  StyledRoot,
  StyledTextField
} from 'components/visual/Inputs/lib/inputs.components';
import { useErrorMessage, useInputBlur, useInputChange, useInputFocus } from 'components/visual/Inputs/lib/inputs.hook';
import type { InputProps, InputValues } from 'components/visual/Inputs/lib/inputs.model';
import { PropProvider, usePropStore } from 'components/visual/Inputs/lib/inputs.provider';
import React, { useEffect, useRef } from 'react';

export type NumberInputProps = InputValues<number, string, React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>> &
  InputProps & {
    autoComplete?: TextFieldProps['autoComplete'];
    max?: number;
    min?: number;
    step?: number;
  };

const WrappedNumberInput = () => {
  const [get] = usePropStore<NumberInputProps>();

  const inputValue = get('inputValue') ?? '';
  const loading = get('loading');
  const max = get('max');
  const min = get('min');
  const step = get('step');
  const value = get('value');

  const inputRef = useRef<HTMLInputElement>(null);

  const handleBlur = useInputBlur<NumberInputProps>();
  const handleChange = useInputChange<NumberInputProps>();
  const handleFocus = useInputFocus<NumberInputProps>();

  useErrorMessage();

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
              value={inputValue}
              onChange={e => handleChange(e, e.target.value, e.target.value !== '' ? Number(e.target.value) : null)}
              onFocus={handleFocus}
              onBlur={e => handleBlur(e, value == null ? '' : String(value), value)}
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

export const NumberInput = ({ preventRender = false, value, ...props }: NumberInputProps) =>
  preventRender ? null : (
    <PropProvider<NumberInputProps>
      props={{
        autoComplete: 'off',
        enforceValidValue: true,
        inputValue: value == null ? '' : String(value),
        max: null,
        min: null,
        preventRender,
        spinnerAdornment: true,
        step: 1,
        value,
        ...props
      }}
    >
      <WrappedNumberInput />
    </PropProvider>
  );
