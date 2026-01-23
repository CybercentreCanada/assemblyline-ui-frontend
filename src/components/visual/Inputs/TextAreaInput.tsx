import type { TextFieldProps } from '@mui/material';
import { Skeleton } from '@mui/material';
import type { StyledTextFieldProps } from 'components/visual/Inputs/lib/inputs.components';
import {
  HelperText,
  StyledFormControl,
  StyledFormLabel,
  StyledRoot,
  StyledTextField
} from 'components/visual/Inputs/lib/inputs.components';
import {
  useErrorCallback,
  useInputBlur,
  useInputChange,
  useInputFocus
} from 'components/visual/Inputs/lib/inputs.hook';
import type { InputProps, InputValues } from 'components/visual/Inputs/lib/inputs.model';
import { PropProvider, usePropStore } from 'components/visual/Inputs/lib/inputs.provider';
import React from 'react';

export type TextAreaInputProps = InputValues<
  string,
  string,
  React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
> &
  InputProps & {
    autoComplete?: StyledTextFieldProps['autoComplete'];
    placeholder?: StyledTextFieldProps['placeholder'];
    rows?: TextFieldProps['rows'];
    minRows?: TextFieldProps['minRows'];
    maxRows?: TextFieldProps['maxRows'];
  };

const WrappedTextAreaInput = () => {
  const [get] = usePropStore<TextAreaInputProps>();

  const autoComplete = get('autoComplete');
  const inputValue = get('inputValue') ?? '';
  const loading = get('loading');
  const placeholder = get('placeholder');
  const maxRows = get('maxRows');
  const minRows = get('minRows');
  const overflowHidden = get('overflowHidden');
  const password = get('password');
  const rows = get('rows');
  const showPassword = get('showPassword');
  const tiny = get('tiny');
  const value = get('value');

  const handleBlur = useInputBlur<TextAreaInputProps>();
  const handleChange = useInputChange<TextAreaInputProps>();
  const handleFocus = useInputFocus<TextAreaInputProps>();

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
              {...(!(overflowHidden || (password && showPassword)) && {
                multiline: true,
                ...(minRows || maxRows ? { minRows, maxRows } : { rows: rows || 1 })
              })}
              autoComplete={autoComplete}
              placeholder={placeholder}
              value={inputValue}
              onChange={e => handleChange(e, e.target.value, e.target.value)}
              onFocus={handleFocus}
              onBlur={e => handleBlur(e, value, value)}
            />
            <HelperText />
          </>
        )}
      </StyledFormControl>
    </StyledRoot>
  );
};

export const TextAreaInput = ({ preventRender = false, value, ...props }: TextAreaInputProps) => {
  const errorMessage = useErrorCallback({ preventRender, value, ...props });

  return preventRender ? null : (
    <PropProvider<TextAreaInputProps>
      props={{
        autoComplete: 'off',
        errorMessage,
        inputValue: value,
        placeholder: undefined,
        maxRows: null,
        minRows: null,
        preventRender,
        rows: null,
        value,
        ...props
      }}
    >
      <WrappedTextAreaInput />
    </PropProvider>
  );
};
