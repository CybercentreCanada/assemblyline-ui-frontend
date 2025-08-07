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
import React from 'react';

export type NumberInputProps = InputValues<number, string, React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>> &
  InputProps & {
    max?: number;
    min?: number;
  };

const WrappedNumberInput = React.memo(() => {
  const [get] = usePropStore<NumberInputProps>();

  const inputValue = get('inputValue');
  const loading = get('loading');
  const password = get('password');
  const showPassword = get('showPassword');
  const tiny = get('tiny');
  const value = get('value');

  const { handleChange, handleFocus, handleBlur } = useInputHandlers<NumberInputProps>();

  return (
    <StyledRoot>
      <StyledFormLabel />
      <StyledFormControl>
        {loading ? (
          <StyledInputSkeleton />
        ) : (
          <>
            <StyledTextField
              type={password && showPassword ? 'password' : 'number'}
              value={inputValue}
              onChange={e => handleChange(e, e.target.value, e.target.value !== '' ? Number(e.target.value) : null)}
              onFocus={handleFocus}
              onBlur={e => handleBlur(e, value !== null ? String(value) : '')}
              slotProps={{
                input: {
                  style: {
                    // ...(typeof min === 'number' && { min }),
                    // ...(typeof max === 'number' && { max }),
                    ...(tiny && { padding: '2.5px 4px 2.5px 8px' })
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

export const NumberInput = ({ max = null, min = null, preventRender = false, value, ...props }: NumberInputProps) => {
  const parsedProps = useInputParsedProps<number, string, NumberInputProps>({
    ...props,
    max,
    min,
    preventRender,
    value
  });

  return preventRender ? null : (
    <PropProvider<NumberInputProps> props={{ ...parsedProps, inputValue: value !== null ? String(value) : '' }}>
      <WrappedNumberInput />
    </PropProvider>
  );
};
