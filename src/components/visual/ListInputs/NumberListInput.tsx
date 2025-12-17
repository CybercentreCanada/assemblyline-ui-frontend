import type { TextFieldProps } from '@mui/material';
import { useErrorCallback } from 'components/visual/Inputs/lib/inputs.hook';
import {
  StyledHelperText,
  StyledListInputInner,
  StyledListInputLoading,
  StyledListInputText,
  StyledListInputWrapper,
  StyledListItemRoot,
  StyledPasswordAdornment,
  StyledResetAdornment,
  StyledTextField
} from 'components/visual/ListInputs/lib/listinputs.components';
import { useInputBlur, useInputChange, useInputFocus } from 'components/visual/ListInputs/lib/listinputs.hook';
import type { ListInputProps, ListInputValues } from 'components/visual/ListInputs/lib/listinputs.model';
import { PropProvider, usePropStore } from 'components/visual/ListInputs/lib/listinputs.provider';
import React, { useEffect, useRef } from 'react';

export type NumberListInputProps = ListInputValues<number, string> &
  ListInputProps & {
    autoComplete?: TextFieldProps['autoComplete'];
    max?: number;
    min?: number;
    step?: number;
  };

const WrappedNumberListInput = React.memo(() => {
  const [get] = usePropStore<NumberListInputProps>();

  const inputValue = get('inputValue') ?? '';
  const loading = get('loading');
  const max = get('max');
  const min = get('min');
  const step = get('step');
  const tiny = get('tiny');
  const value = get('value');
  const width = get('width');

  const inputRef = useRef<HTMLInputElement>(null);

  const handleBlur = useInputBlur<NumberListInputProps>();
  const handleChange = useInputChange<NumberListInputProps>();
  const handleFocus = useInputFocus<NumberListInputProps>();

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
    <StyledListItemRoot>
      <StyledListInputWrapper>
        <StyledListInputInner>
          <StyledListInputText />

          {loading ? (
            <StyledListInputLoading />
          ) : (
            <>
              <StyledPasswordAdornment />
              <StyledResetAdornment />
              <StyledTextField
                ref={inputRef}
                type="number"
                value={inputValue}
                onChange={e => handleChange(e, e.target.value, e.target.value !== '' ? Number(e.target.value) : null)}
                onFocus={handleFocus}
                onBlur={e => handleBlur(e, value == null ? '' : String(value), value)}
                sx={{
                  maxWidth: width,
                  minWidth: width,
                  margin: 0,
                  '&.MuiInputBase-root': {
                    // paddingRight: '9px',
                    ...(!tiny && { minHeight: '40px' })
                  },
                  '& .MuiSelect-select': {
                    // padding: '8px 8px 8px 14px !important',
                    ...(tiny && {
                      padding: '4.5px 8px 4.5px 14px !important'
                    })
                  }
                }}
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
            </>
          )}
        </StyledListInputInner>

        <StyledHelperText />
      </StyledListInputWrapper>
    </StyledListItemRoot>
  );
});

export const NumberListInput = ({ preventRender = false, value, ...props }: NumberListInputProps) => {
  const errorMessage = useErrorCallback({ preventRender, value, ...props });

  return preventRender ? null : (
    <PropProvider<NumberListInputProps>
      props={{
        autoComplete: 'off',
        enforceValidValue: true,
        errorMessage,
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
      <WrappedNumberListInput />
    </PropProvider>
  );
};

NumberListInput.displayName = 'NumberListInput';
