import type { FormControlLabelProps } from '@mui/material';
import { Radio, RadioGroup } from '@mui/material';
import { PropProvider, usePropStore } from 'features/prop-provider/PropProvider';
import React from 'react';
import {
  HelpInputAdornment,
  InputButtonEndAdornment,
  PasswordInputAdornment,
  ProgressInputAdornment,
  ResetInputAdornment
} from 'ui/inputs/components/inputs.component.adornment';
import {
  InputButtonFormControlLabel,
  InputButtonLabel,
  InputFormButton
} from 'ui/inputs/components/inputs.component.buttons';
import {
  InputFormControl,
  InputFormLabel,
  InputHelperText,
  InputRoot
} from 'ui/inputs/components/inputs.component.form';
import { useInputChange, useInputClickBlur, useInputFocus } from 'ui/inputs/hooks/inputs.hook.event_handlers';
import { useInputValidation } from 'ui/inputs/hooks/inputs.hook.validation';
import type { InputOptions, InputRuntimeState, InputSlotProps, InputValueModel } from 'ui/inputs/models/inputs.model';
import { DEFAULT_INPUT_CONTROLLER_PROPS } from 'ui/inputs/models/inputs.model';

type Option = Omit<FormControlLabelProps, 'control' | 'label'> & {
  control?: FormControlLabelProps['control'];
  label?: string;
};

export type RadioInputProps<O extends readonly Option[]> = InputValueModel<
  O[number]['value'],
  React.MouseEvent<HTMLButtonElement, MouseEvent>
> &
  InputOptions &
  InputSlotProps & {
    options: O;
  };

type RadioInputController<O extends readonly Option[]> = RadioInputProps<O> & InputRuntimeState<O[number]['value']>;

const WrappedRadioInput = <O extends readonly Option[]>() => {
  const [get] = usePropStore<RadioInputController<O>>();

  const isFocused = get('isFocused');
  const rawValue = get('rawValue') ?? '';
  const options = get('options');
  const preventDisabledColor = get('preventDisabledColor');
  const readOnly = get('readOnly');
  const value = get('value');

  const handleBlur = useInputClickBlur<O[number]['value']>();
  const handleChange = useInputChange<O[number]['value']>();
  const handleFocus = useInputFocus<O[number]['value']>();

  return (
    <InputRoot>
      <InputFormLabel />
      <InputFormControl>
        <RadioGroup value={rawValue}>
          {options.map((option, index) => (
            <InputFormButton
              key={`${index}-${option.label}`}
              onFocus={handleFocus}
              onBlur={e => handleBlur(e, value, rawValue)}
              onClick={e => handleChange(e, option.value, rawValue)}
            >
              <InputButtonFormControlLabel
                label={
                  <InputButtonLabel
                    label={option.label}
                    isFocused={isFocused && rawValue === (option.value ?? '')}
                    ignoreRequired
                    ignoreTooltipIcon
                  />
                }
                value={option.value ?? ''}
              >
                <Radio
                  disableFocusRipple
                  disableRipple
                  disableTouchRipple
                  size="small"
                  sx={{
                    paddingTop: '0px',
                    paddingBottom: '0px',
                    minWidth: '40px',
                    ...((preventDisabledColor || readOnly) && { color: 'inherit !important' })
                  }}
                />
              </InputButtonFormControlLabel>
            </InputFormButton>
          ))}
        </RadioGroup>

        <InputButtonEndAdornment>
          <HelpInputAdornment />
          <PasswordInputAdornment />
          <ProgressInputAdornment />
          <ResetInputAdornment />
        </InputButtonEndAdornment>
      </InputFormControl>
      <InputHelperText />
    </InputRoot>
  );
};

export const RadioInput = <O extends readonly Option[]>({
  preventRender = false,
  value = null,
  ...props
}: RadioInputProps<O>) => {
  const { status: validationStatus, message: validationMessage } = useInputValidation<O[number]['value']>({
    value: value ?? '',
    ...props
  });

  return preventRender ? null : (
    <PropProvider<RadioInputController<O>>
      initialProps={DEFAULT_INPUT_CONTROLLER_PROPS as RadioInputController<O>}
      props={{
        options: [] as unknown as O,
        preventRender,
        rawValue: value ?? '',
        validationMessage,
        validationStatus,
        value,
        ...props
      }}
    >
      <WrappedRadioInput<O> />
    </PropProvider>
  );
};
