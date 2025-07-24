import type { TextFieldProps } from '@mui/material';
import { InputAdornment, Skeleton } from '@mui/material';
import { HelperText } from 'components/visual/Inputs/components/HelperText';
import {
  StyledFormControl,
  StyledFormLabel,
  StyledTextField,
  usePreventPassword,
  usePreventReset
} from 'components/visual/Inputs/components/InputComponents';
import { PasswordInput } from 'components/visual/Inputs/components/PasswordInput';
import { ResetInput } from 'components/visual/Inputs/components/ResetInput';
import type { InputProps } from 'components/visual/Inputs/models/Input';
import React, { useState } from 'react';

export type TextAreaInputProps = Omit<TextFieldProps, 'rows' | 'onChange' | 'error' | 'defaultValue'> &
  InputProps<string> & {
    rows: TextFieldProps['rows'];
  };

const WrappedTextAreaInput = (props: TextAreaInputProps) => {
  const {
    disabled,
    endAdornment = null,
    error = () => '',
    loading = false,
    password = false,
    preventRender = false,
    readOnly = false,
    rootProps = null,
    rows = 1,
    tiny = false,
    value,
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
          <Skeleton
            sx={{ height: `calc(23px * ${rows} + 17px)`, transform: 'unset', ...(tiny && { height: '28px' }) }}
          />
        ) : (
          <>
            <StyledTextField
              props={props}
              multiline
              rows={password && showPassword ? 1 : rows}
              value={value}
              slotProps={{
                input: {
                  inputProps: {
                    sx: {
                      ...(tiny && { padding: '2.5px 4px 2.5px 8px' }),
                      ...(password &&
                        showPassword && {
                          fontFamily: 'password',
                          WebkitTextSecurity: 'disc',
                          MozTextSecurity: 'disc',
                          textSecurity: 'disc'
                        })
                    }
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
                onChange(event, event.target.value);

                const err = error(event.target.value);
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
            />
            <HelperText props={props} />
          </>
        )}
      </StyledFormControl>
    </div>
  );
};

export const TextAreaInput: React.FC<TextAreaInputProps> = React.memo(WrappedTextAreaInput);
