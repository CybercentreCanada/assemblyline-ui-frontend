import type { TextFieldProps } from '@mui/material';
import { InputAdornment } from '@mui/material';
import { HelperText } from 'components/visual/Inputs/components/HelperText';
import {
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
import React, { useState } from 'react';

export type NumberInputProps = Omit<TextFieldProps, 'error' | 'value' | 'onChange'> &
  InputProps<number> & {
    max?: number;
    min?: number;
    unnullable?: boolean;
  };

const WrappedNumberInput = (props: NumberInputProps) => {
  const {
    disabled = false,
    endAdornment = null,
    error = () => '',
    loading = false,
    max = null,
    min = null,
    password = false,
    preventRender = false,
    readOnly = false,
    rootProps = null,
    tiny = false,
    unnullable = false,
    value = null,
    onBlur = () => null,
    onChange = () => null,
    onError = () => null,
    onFocus = () => null
  } = props;

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
          <>
            <StyledTextField
              props={props}
              value={[null, undefined, '', NaN].includes(value) ? '' : `${value}`}
              type={password && showPassword ? 'password' : 'number'}
              slotProps={{
                input: {
                  inputProps: {
                    ...(min && { min: min }),
                    ...(max && { max: max }),
                    ...(tiny && { sx: { padding: '2.5px 4px 2.5px 8px' } })
                  },
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
              onChange={event => {
                const value = event.target.value;

                if (!unnullable && [null, undefined, '', NaN].includes(value)) {
                  onChange(event, null);

                  const err = error(null);
                  if (err) onError(null);
                } else {
                  let num = Number(event.target.value);
                  num = max !== null && max !== undefined ? Math.min(num, max) : num;
                  num = min !== null && min !== undefined ? Math.max(num, min) : num;
                  onChange(event, num);

                  const err = error(num);
                  if (err) onError(err);
                }
              }}
              onFocus={(event, ...other) => {
                setFocused(!readOnly && !disabled && document.activeElement === event.target);
                onFocus(event, ...other);
              }}
              onBlur={(event, ...other) => {
                setFocused(false);
                onBlur(event, ...other);
              }}
            />
            <HelperText props={props} />
          </>
        )}
      </StyledFormControl>
    </div>
  );
};

export const NumberInput: React.FC<NumberInputProps> = React.memo(WrappedNumberInput);
