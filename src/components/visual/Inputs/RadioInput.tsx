import type { FormControlLabelProps } from '@mui/material';
import { Radio, RadioGroup } from '@mui/material';
import {
  HelperText,
  PasswordInput,
  ResetInput,
  StyledButtonLabel,
  StyledEndAdornmentBox,
  StyledFormButton,
  StyledFormControl,
  StyledFormControlLabel,
  StyledFormLabel,
  StyledRoot
} from 'components/visual/Inputs/lib/inputs.components';
import { useInputHandlers, useInputParsedProps } from 'components/visual/Inputs/lib/inputs.hook';
import type { InputProps, InputValues } from 'components/visual/Inputs/lib/inputs.model';
import { PropProvider, usePropStore } from 'components/visual/Inputs/lib/inputs.provider';
import React from 'react';

type Option = Omit<FormControlLabelProps, 'control' | 'label'> & {
  control?: FormControlLabelProps['control'];
  label?: string;
};

export type RadioInputProps<O extends readonly Option[]> = InputValues<
  O[number]['value'],
  O[number]['value'],
  React.MouseEvent<HTMLButtonElement, MouseEvent>
> &
  InputProps & {
    options: O;
  };

const WrappedRadioInput = React.memo(<O extends readonly Option[]>() => {
  const [get] = usePropStore<RadioInputProps<O>>();

  const focused = get('focused');
  const inputValue = get('inputValue') ?? '';
  const options = get('options');
  const preventDisabledColor = get('preventDisabledColor');
  const readOnly = get('readOnly');
  const value = get('value');

  const { handleChange, handleFocus, handleBlur } = useInputHandlers<RadioInputProps<O>>();

  return (
    <StyledRoot>
      <StyledFormLabel />
      <StyledFormControl>
        <RadioGroup value={inputValue}>
          {options.map((option, index) => (
            <StyledFormButton
              key={`${index}-${option.label}`}
              onFocus={handleFocus}
              onBlur={e => handleBlur(e, value)}
              onClick={e => handleChange(e, option.value, option.value)}
            >
              <StyledFormControlLabel
                label={
                  <StyledButtonLabel label={option.label} focused={focused && inputValue === (option.value ?? '')} />
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
          <PasswordInput />
          <ResetInput />
        </StyledEndAdornmentBox>
      </StyledFormControl>
      <HelperText />
    </StyledRoot>
  );
});

export const RadioInput = <O extends readonly Option[]>({
  options = [] as unknown as O,
  preventRender = false,
  value = null,
  ...props
}: RadioInputProps<O>) => {
  const parsedProps = useInputParsedProps<O[number]['value'], O[number]['value'], RadioInputProps<O>>({
    ...props,
    options,
    preventRender,
    value
  });

  return preventRender ? null : (
    <PropProvider<RadioInputProps<O>> props={parsedProps}>
      <WrappedRadioInput />
    </PropProvider>
  );
};
