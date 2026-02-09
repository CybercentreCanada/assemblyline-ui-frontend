import type { FormControlLabelProps } from '@mui/material';
import { Radio, RadioGroup } from '@mui/material';
import { PropProvider, usePropStore } from 'components/core/PropProvider/PropProvider';
import {
  HelpInputAdornment,
  InputButtonEndAdornment,
  PasswordInputAdornment,
  ProgressInputAdornment,
  ResetInputAdornment
} from 'components/visual/Inputs/components/inputs.component.adornment';
import {
  InputButtonFormControlLabel,
  InputButtonLabel,
  InputFormButton
} from 'components/visual/Inputs/components/inputs.component.buttons';
import {
  InputFormControl,
  InputFormLabel,
  InputHelperText,
  InputRoot
} from 'components/visual/Inputs/components/inputs.component.form';
import {
  useInputChange,
  useInputClickBlur,
  useInputFocus
} from 'components/visual/Inputs/hooks/inputs.hook.event_handlers';
import { useInputValidation } from 'components/visual/Inputs/hooks/inputs.hook.validation';
import type {
  InputOptions,
  InputRuntimeState,
  InputSlotProps,
  InputValueModel
} from 'components/visual/Inputs/models/inputs.model';
import { DEFAULT_INPUT_CONTROLLER_PROPS } from 'components/visual/Inputs/models/inputs.model';
import React from 'react';

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
        value,
        rawValue: value ?? '',
        validationStatus,
        validationMessage,
        ...props
      }}
    >
      <WrappedRadioInput<O> />
    </PropProvider>
  );
};
