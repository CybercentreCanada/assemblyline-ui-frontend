import type { TextFieldProps } from '@mui/material';
import { PropProvider, usePropStore } from 'components/core/PropProvider/PropProvider';
import { useInputBlur, useInputChange, useInputFocus, useValidation } from 'components/visual/Inputs/lib/inputs.hook';
import type { InputRuntimeState, InputValueModel } from 'components/visual/Inputs/lib/inputs.model';
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
import type { ListInputOptions } from 'components/visual/ListInputs/lib/listinputs.model';
import { DEFAULT_LIST_INPUT_CONTROLLER_PROPS } from 'components/visual/ListInputs/lib/listinputs.model';
import React, { useEffect, useRef } from 'react';

export type NumberListInputProps = InputValueModel<number, string> &
  ListInputOptions & {
    autoComplete?: TextFieldProps['autoComplete'];
    max?: number;
    min?: number;
    step?: number;
  };

type NumberListInputController = NumberListInputProps & InputRuntimeState;

const WrappedNumberListInput = React.memo(() => {
  const [get] = usePropStore<NumberListInputController>();

  const rawValue = get('rawValue') ?? '';
  const loading = get('loading');
  const max = get('max');
  const min = get('min');
  const step = get('step');
  const tiny = get('tiny');
  const value = get('value');
  const width = get('width');

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
                value={rawValue}
                onChange={e => handleChange(e, e.target.value !== '' ? Number(e.target.value) : null, e.target.value)}
                onFocus={handleFocus}
                onBlur={e => handleBlur(e, value, value == null ? '' : String(value))}
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
  const { status: validationStatus, message: validationMessage } = useValidation<number, string>({
    value: value,
    rawValue: value == null ? '' : String(value),
    ...props
  });

  return preventRender ? null : (
    <PropProvider<NumberListInputController>
      initialProps={DEFAULT_LIST_INPUT_CONTROLLER_PROPS as NumberListInputController}
      props={{
        autoComplete: 'off',
        max: null,
        min: null,
        preventRender,
        rawValue: value == null ? '' : String(value),
        showSpinner: true,
        step: 1,
        validationMessage,
        validationStatus,
        value,
        ...props
      }}
    >
      <WrappedNumberListInput />
    </PropProvider>
  );
};

NumberListInput.displayName = 'NumberListInput';
