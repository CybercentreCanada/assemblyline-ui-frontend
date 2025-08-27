import type { TextFieldProps } from '@mui/material';
import { Skeleton } from '@mui/material';
import {
  HelperText,
  StyledFormControl,
  StyledFormLabel,
  StyledRoot,
  StyledTextField
} from 'components/visual/Inputs/lib/inputs.components';
import { useInputBlur, useInputChange, useInputFocus } from 'components/visual/Inputs/lib/inputs.hook';
import type { InputProps, InputValues } from 'components/visual/Inputs/lib/inputs.model';
import { PropProvider, usePropStore } from 'components/visual/Inputs/lib/inputs.provider';
import React from 'react';

export type TextAreaInputProps = InputValues<
  string,
  string,
  React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
> &
  InputProps & {
    autoComplete?: StyledTextField['autoComplete'];
    rows?: TextFieldProps['rows'];
  };

const WrappedTextAreaInput = () => {
  const [get] = usePropStore<TextAreaInputProps>();

  const autoComplete = get('autoComplete');
  const inputValue = get('inputValue') ?? '';
  const loading = get('loading');
  const overflowHidden = get('overflowHidden');
  const password = get('password');
  const rows = get('rows');
  const showPassword = get('showPassword');
  const tiny = get('tiny');

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
              rows={1}
              {...(!(overflowHidden || (password && showPassword)) && {
                multiline: true,
                rows: rows
              })}
              autoComplete={autoComplete}
              value={inputValue}
              onChange={e => handleChange(e, e.target.value, e.target.value)}
              onFocus={handleFocus}
              onBlur={e => handleBlur(e)}
            />
            <HelperText />
          </>
        )}
      </StyledFormControl>
    </StyledRoot>
  );
};

export const TextAreaInput = ({ preventRender = false, value, ...props }: TextAreaInputProps) =>
  preventRender ? null : (
    <PropProvider<TextAreaInputProps>
      props={{ autoComplete: 'off', rows: 1, preventRender, inputValue: value, value, ...props }}
    >
      <WrappedTextAreaInput />
    </PropProvider>
  );
