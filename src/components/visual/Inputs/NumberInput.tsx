import type { TextFieldProps } from '@mui/material';
import { PropProvider, usePropStore } from 'components/core/PropProvider/PropProvider';
import {
  InputFormControl,
  InputFormLabel,
  InputHelperText,
  InputRoot,
  InputSkeleton
} from 'components/visual/Inputs/components/inputs.component.form';
import { InputTextField } from 'components/visual/Inputs/components/inputs.component.textfield';
import { useInputBlur, useInputChange, useInputFocus } from 'components/visual/Inputs/hooks/inputs.hook.event_handlers';
import { useInputValidation } from 'components/visual/Inputs/hooks/inputs.hook.validation';
import type {
  InputOptions,
  InputRuntimeState,
  InputSlotProps,
  InputValueModel
} from 'components/visual/Inputs/models/inputs.model';
import { DEFAULT_INPUT_CONTROLLER_PROPS } from 'components/visual/Inputs/models/inputs.model';
import React, { useCallback, useEffect, useRef } from 'react';

export type NumberInputProps = InputValueModel<number, React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>> &
  InputOptions &
  InputSlotProps & {
    autoComplete?: TextFieldProps['autoComplete'];
    max?: number;
    min?: number;
    step?: number;
  };

type NumberInputController = NumberInputProps & InputRuntimeState<string>;

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
    <InputRoot>
      <InputFormLabel />
      <InputFormControl>
        {loading ? (
          <InputSkeleton />
        ) : (
          <>
            <InputTextField
              ref={inputRef}
              type="number"
              value={rawValue}
              onChange={e => handleChange(e, e.target.value, rawValue, toValue)}
              onFocus={handleFocus}
              onBlur={e => handleBlur(e, toRawValue(value), rawValue, toValue, toRawValue)}
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
            <InputHelperText />
          </>
        )}
      </InputFormControl>
    </InputRoot>
  );
};

export const NumberInput = ({ preventRender = false, value, ...props }: NumberInputProps) => {
  const { status: validationStatus, message: validationMessage } = useInputValidation<number, string>({
    value: value,
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
        showNumericalSpinner: true,
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
