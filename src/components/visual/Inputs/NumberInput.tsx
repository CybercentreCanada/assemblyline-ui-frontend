import type { TextFieldProps } from '@mui/material';
import {
  HelperText,
  StyledFormControl,
  StyledFormLabel,
  StyledInputSkeleton,
  StyledRoot,
  StyledTextField
} from 'components/visual/Inputs/lib/inputs.components';
import { useInputHandlers, useInputParsedProps } from 'components/visual/Inputs/lib/inputs.hook';
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

const WrappedNumberInput = React.memo(() => {
  const [get] = usePropStore<NumberInputProps>();

  const inputValue = get('inputValue') ?? '';
  const loading = get('loading');
  const max = get('max');
  const min = get('min');
  const step = get('step');
  const value = get('value');

  const inputRef = useRef<HTMLInputElement>(null);

  const { handleChange, handleFocus, handleBlur } = useInputHandlers<NumberInputProps>();

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (document.activeElement === el) {
        e.preventDefault();
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, []);

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
              onBlur={e => handleBlur(e, value == null ? '' : String(value))}
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
});

export const NumberInput = ({
  autoComplete = 'off',
  max = null,
  min = null,
  step = 1,
  preventRender = false,
  value,
  ...props
}: NumberInputProps) => {
  const parsedProps = useInputParsedProps<number, string, NumberInputProps>({
    ...props,
    autoComplete,
    max,
    min,
    preventRender,
    step,
    value
  });

  return preventRender ? null : (
    <PropProvider<NumberInputProps>
      props={{ ...parsedProps, inputValue: value == null ? '' : String(value), preventSpinnerRender: false }}
    >
      <WrappedNumberInput />
    </PropProvider>
  );
};
