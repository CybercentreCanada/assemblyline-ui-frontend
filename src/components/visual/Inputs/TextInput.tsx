import type { AutocompleteProps, AutocompleteValue } from '@mui/material';
import { Autocomplete, InputAdornment, Typography } from '@mui/material';
import { HelperText } from 'components/visual/Inputs/components/HelperText';
import {
  getAriaLabel,
  StyledFormControl,
  StyledFormLabel,
  StyledInputSkeleton,
  StyledTextField,
  usePreventPassword,
  usePreventReset
} from 'components/visual/Inputs/components/InputComponents';
import { PasswordInput } from 'components/visual/Inputs/components/PasswordInput';
import { ResetInput } from 'components/visual/Inputs/components/ResetInput';
import type { InputProps } from 'components/visual/Inputs/models/Input';
import type { ElementType } from 'react';
import React, { useState } from 'react';

export type TextInputProps = Omit<
  AutocompleteProps<string, boolean, boolean, boolean, ElementType>,
  'renderInput' | 'options' | 'onChange' | 'value' | 'defaultValue'
> &
  InputProps<string> & {
    options?: AutocompleteProps<string, boolean, boolean, boolean, ElementType>['options'];
  };

const WrappedTextInput = (props: TextInputProps) => {
  const {
    autoComplete,
    disabled,
    endAdornment = null,
    error = () => '',
    loading = false,
    options = [],
    preventRender = false,
    readOnly = false,
    rootProps = null,
    tiny = false,
    value = '',
    onBlur = () => null,
    onChange = () => null,
    onError = () => null,
    onFocus = () => null
  } = props;

  const [_value, setValue] = useState<AutocompleteValue<string, boolean, boolean, boolean>>(null);
  const [focused, setFocused] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(true);

  const preventPasswordRender = usePreventPassword(props);
  const preventResetRender = usePreventReset(props);

  return preventRender ? null : (
    <div {...rootProps} style={{ textAlign: 'left', ...rootProps?.style }}>
      <StyledFormLabel props={props} focused={focused} />
      <StyledFormControl props={props}>
        {loading ? (
          <StyledInputSkeleton props={props} />
        ) : (
          <Autocomplete
            id={getAriaLabel(props)}
            autoComplete={autoComplete}
            disableClearable
            disabled={disabled}
            freeSolo
            fullWidth
            inputValue={value || ''}
            options={options}
            readOnly={readOnly}
            size="small"
            value={_value}
            onChange={(e, v) => setValue(v)}
            onInputChange={(e, v, o) => {
              setValue(v as AutocompleteValue<string, boolean, boolean, boolean>);
              onChange(e, v, o);

              const err = error(v);
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
            renderOption={(props, option) => (
              <Typography {...props} key={option} {...(tiny && { variant: 'body2' })} children={option} />
            )}
            renderInput={params => (
              <StyledTextField
                {...params}
                props={props}
                slotProps={{
                  input: {
                    endAdornment:
                      preventPasswordRender && preventResetRender && !endAdornment ? null : (
                        <InputAdornment position="end">
                          <PasswordInput
                            props={props}
                            showPassword={showPassword}
                            onShowPassword={() => setShowPassword(p => !p)}
                          />
                          <ResetInput props={props} />
                          {endAdornment}
                        </InputAdornment>
                      )
                  }
                }}
              />
            )}
          />
        )}
        <HelperText props={props} />
      </StyledFormControl>
    </div>
  );
};

export const TextInput: (props: TextInputProps) => React.ReactNode = React.memo(WrappedTextInput);
