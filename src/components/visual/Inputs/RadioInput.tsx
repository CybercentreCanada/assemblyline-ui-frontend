import type { FormControlLabelProps } from '@mui/material';
import { Radio, RadioGroup } from '@mui/material';
import {
  HelperText,
  PasswordInput,
  ResetInput,
  StyledEndAdornmentBox,
  StyledFormButton,
  StyledFormControl,
  StyledFormControlLabel
} from 'components/visual/Inputs/lib/inputs.components';
import type { InputProps } from 'components/visual/Inputs/lib/inputs.model';
import React, { useState } from 'react';

type Option = Omit<FormControlLabelProps, 'control' | 'label'> & {
  control?: FormControlLabelProps['control'];
  label?: string;
};

export type RadioInputProps<O extends Option[] = []> = InputProps<O[number]['value']> & {
  options: O;
};

const WrappedRadioInput = <O extends Option[]>(props: RadioInputProps<O>) => {
  return null;

  const {
    disabled,
    error = () => '',
    options = null,
    preventDisabledColor = false,
    preventRender = false,
    readOnly = false,
    rootProps = null,
    value,
    onBlur = () => null,
    onChange = () => null,
    onError = () => null,
    onFocus = () => null
  } = props;

  const [focused, setFocused] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(true);

  return preventRender ? null : (
    <div {...rootProps} style={{ textAlign: 'left', ...rootProps?.style }}>
      <StyledFormLabel props={props} focused={focused} />
      <StyledFormControl props={props}>
        <RadioGroup value={value}>
          {options.map((option, key) => (
            <StyledFormButton
              key={`${key}-${option.label}`}
              props={{ ...props, value: option.value, label: option.label, error: () => null }}
              onChange={event => {
                onChange(event, option.value);

                const err = error(!option.value);
                if (err) onError(err);
              }}
              onFocus={(event, ...other) => {
                setFocused(!readOnly && !disabled && document.activeElement === event.target);
                onFocus(event, ...other);
              }}
              onBlur={(event, ...other) => {
                setFocused(false);
                onBlur(event, ...other);
              }}
            >
              <StyledFormControlLabel
                props={{ ...props, value: option.value, label: option.label, error: () => null }}
                focused={focused && option.value === value}
                showPassword={showPassword}
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

        <StyledEndAdornmentBox props={props}>
          <PasswordInput props={props} showPassword={showPassword} onShowPassword={() => setShowPassword(p => !p)} />
          <ResetInput props={props} />
        </StyledEndAdornmentBox>
      </StyledFormControl>
      <HelperText props={props} />
    </div>
  );
};

export const RadioInput: <O extends Option[]>(props: RadioInputProps<O>) => React.ReactNode =
  React.memo(WrappedRadioInput);
