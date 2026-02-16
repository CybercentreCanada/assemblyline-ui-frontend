import type { TextFieldProps } from '@mui/material';
import { PropProvider, usePropStore } from 'components/core/PropProvider/PropProvider';
import {
  HelpInputAdornment,
  PasswordInputAdornment,
  ProgressInputAdornment,
  ResetInputAdornment
} from 'components/visual/Inputs/components/inputs.component.adornment';
import { InputHelperText } from 'components/visual/Inputs/components/inputs.component.form';
import { useInputBlur, useInputChange, useInputFocus } from 'components/visual/Inputs/hooks/inputs.hook.event_handlers';
import { useInputValidation } from 'components/visual/Inputs/hooks/inputs.hook.validation';
import type { InputRuntimeState, InputValueModel } from 'components/visual/Inputs/models/inputs.model';
import {
  ListInputInner,
  ListInputLoading,
  ListInputRoot,
  ListInputText,
  ListInputTextField,
  ListInputWrapper
} from 'components/visual/ListInputs/lib/listinputs.components';
import type { ListInputOptions, ListInputSlotProps } from 'components/visual/ListInputs/lib/listinputs.model';
import { DEFAULT_LIST_INPUT_CONTROLLER_PROPS } from 'components/visual/ListInputs/lib/listinputs.model';
import React, { useCallback, useEffect, useRef } from 'react';

export type NumberListInputProps = InputValueModel<number> &
  ListInputOptions &
  ListInputSlotProps & {
    autoComplete?: TextFieldProps['autoComplete'];
    max?: number;
    min?: number;
    step?: number;
  };

type NumberListInputController = NumberListInputProps & InputRuntimeState<string>;

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

  const toRawValue = useCallback((v: number) => (v == null ? '' : String(v)), []);
  const toValue = useCallback((v: string): number => (v !== '' ? Number(v) : null), []);

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
    <ListInputRoot>
      <ListInputWrapper>
        <ListInputInner>
          <ListInputText />

          {loading ? (
            <ListInputLoading />
          ) : (
            <>
              <HelpInputAdornment />
              <PasswordInputAdornment />
              <ProgressInputAdornment />
              <ResetInputAdornment />
              <ListInputTextField
                ref={inputRef}
                type="number"
                value={rawValue}
                onBlur={e => handleBlur(e, toRawValue(value), rawValue, toValue, toRawValue)}
                onChange={e => handleChange(e, e.target.value, rawValue, toValue)}
                onFocus={handleFocus}
                onInvalid={e => e.preventDefault()}
                sx={{
                  maxWidth: width,
                  minWidth: width,
                  margin: 0
                }}
                slotProps={{
                  input: {
                    inputProps: {
                      sx: {
                        ...(tiny && { padding: '4.5px 0px 4.5px 0px !important' })
                      },
                      ...(typeof max === 'number' && { max }),
                      ...(typeof min === 'number' && { min }),
                      ...(typeof step === 'number' && { step })
                    }
                  }
                }}
              />
            </>
          )}
        </ListInputInner>

        <InputHelperText sx={{ width: '100%', justifyContent: 'flex-end', margin: 0 }} />
      </ListInputWrapper>
    </ListInputRoot>
  );
});

export const NumberListInput = ({ preventRender = false, value, ...props }: NumberListInputProps) => {
  const { status: validationStatus, message: validationMessage } = useInputValidation<number, string>({
    value: value,
    ...props
  });

  return preventRender ? null : (
    <PropProvider<NumberListInputController>
      initialProps={DEFAULT_LIST_INPUT_CONTROLLER_PROPS as NumberListInputController}
      props={(prev, state) => ({
        autoComplete: 'off',
        max: null,
        min: null,
        preventRender,
        rawValue: value === state?.value ? state?.rawValue : value == null ? '' : String(value),
        showNumericalSpinner: true,
        step: 1,
        validationMessage,
        validationStatus,
        value,
        ...props
      })}
    >
      <WrappedNumberListInput />
    </PropProvider>
  );
};

NumberListInput.displayName = 'NumberListInput';
