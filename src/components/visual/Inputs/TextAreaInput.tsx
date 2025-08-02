import type { TextFieldProps } from '@mui/material';
import { Skeleton } from '@mui/material';
import {
  HelperText,
  StyledFormControl,
  StyledFormLabel,
  StyledRoot,
  StyledTextField
} from 'components/visual/Inputs/lib/inputs.components';
import { useDefaultError, useDefaultHandlers } from 'components/visual/Inputs/lib/inputs.hook';
import type { InputProps, InputValues } from 'components/visual/Inputs/lib/inputs.model';
import { PropProvider, usePropStore } from 'components/visual/Inputs/lib/inputs.provider';
import React from 'react';

export type TextAreaInputProps = InputValues<string> &
  InputProps & {
    rows?: TextFieldProps['rows'];
  };

const WrappedTextAreaInput = () => {
  const [get] = usePropStore<TextAreaInputProps>();

  const inputValue = get(s => s.inputValue);
  const loading = get(s => s.loading);
  const password = get(s => s.password);
  const rows = get(s => s.rows);
  const showPassword = get(s => s.showPassword);
  const tiny = get(s => s.tiny);
  const value = get(s => s.value);

  const { handleChange, handleFocus, handleBlur } = useDefaultHandlers();

  return (
    <StyledRoot>
      <StyledFormLabel />
      <StyledFormControl>
        {loading ? (
          <Skeleton
            sx={{ height: `calc(23px * ${rows} + 17px)`, transform: 'unset', ...(tiny && { height: '28px' }) }}
          />
        ) : (
          <>
            <StyledTextField
              multiline
              rows={password && showPassword ? 1 : rows}
              type={password && showPassword ? 'password' : 'text'}
              value={inputValue ?? value ?? ''}
              onChange={e => handleChange(e, e.target.value, e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
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
                  }
                }
              }}
            />
            <HelperText />
          </>
        )}
      </StyledFormControl>
    </StyledRoot>
  );
};

export const TextAreaInput: React.FC<TextAreaInputProps> = React.memo(
  ({ rows = 1, preventRender = false, value, ...props }) => {
    const newError = useDefaultError(props);

    return preventRender ? null : (
      <PropProvider<TextAreaInputProps>
        data={{
          ...props,
          error: newError,
          errorMsg: newError(value),
          rows,
          value
        }}
      >
        <WrappedTextAreaInput />
      </PropProvider>
    );
  }
);
