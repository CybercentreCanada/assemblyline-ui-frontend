import type { FormControlLabelProps } from '@mui/material';
import { Radio, RadioGroup } from '@mui/material';
import { PropProvider, usePropStore } from 'components/core/PropProvider/PropProvider';
import {
  HelperText,
  PasswordAdornment,
  ResetAdornment,
  StyledButtonLabel,
  StyledEndAdornmentBox,
  StyledFormButton,
  StyledFormControl,
  StyledFormControlLabel,
  StyledFormLabel,
  StyledRoot
} from 'components/visual/Inputs/lib/inputs.components';
import {
  useInputChange,
  useInputClickBlur,
  useInputFocus,
  useValidation
} from 'components/visual/Inputs/lib/inputs.hook';
import type { InputOptions, InputRuntimeState, InputValueModel } from 'components/visual/Inputs/lib/inputs.model';
import { DEFAULT_INPUT_CONTROLLER_PROPS } from 'components/visual/Inputs/lib/inputs.model';
import React from 'react';

type Option = Omit<FormControlLabelProps, 'control' | 'label'> & {
  control?: FormControlLabelProps['control'];
  label?: string;
};

export type RadioInputProps<O extends readonly Option[]> = InputValueModel<
  O[number]['value'],
  O[number]['value'],
  React.MouseEvent<HTMLButtonElement, MouseEvent>
> &
  InputOptions & {
    options: O;
  };

type RadioInputController<O extends readonly Option[]> = RadioInputProps<O> & InputRuntimeState;

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
    <StyledRoot>
      <StyledFormLabel />
      <StyledFormControl>
        <RadioGroup value={rawValue}>
          {options.map((option, index) => (
            <StyledFormButton
              key={`${index}-${option.label}`}
              onFocus={handleFocus}
              onBlur={e => handleBlur(e, value, value)}
              onClick={e => handleChange(e, option.value, option.value)}
            >
              <StyledFormControlLabel
                label={
                  <StyledButtonLabel
                    label={option.label}
                    isFocused={isFocused && rawValue === (option.value ?? '')}
                    ignoreRequired
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
              </StyledFormControlLabel>
            </StyledFormButton>
          ))}
        </RadioGroup>

        <StyledEndAdornmentBox>
          <PasswordAdornment />
          <ResetAdornment />
        </StyledEndAdornmentBox>
      </StyledFormControl>
      <HelperText />
    </StyledRoot>
  );
};

export const RadioInput = <O extends readonly Option[]>({
  preventRender = false,
  value = null,
  ...props
}: RadioInputProps<O>) => {
  const { status: validationStatus, message: validationMessage } = useValidation<O[number]['value']>({
    value: value ?? '',
    rawValue: value ?? '',
    ...props
  });

  return preventRender ? null : (
    <PropProvider<RadioInputController<O>>
      initialProps={DEFAULT_INPUT_CONTROLLER_PROPS as RadioInputController<O>}
      props={{
        options: [] as unknown as O,
        preventRender,
        value,
        rawValue: value,
        validationStatus,
        validationMessage,
        ...props
      }}
    >
      <WrappedRadioInput />
    </PropProvider>
  );
};
