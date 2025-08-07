import type { TextFieldProps } from '@mui/material';
import { Skeleton } from '@mui/material';
import {
  HelperText,
  StyledFormControl,
  StyledFormLabel,
  StyledRoot,
  StyledTextField
} from 'components/visual/Inputs/lib/inputs.components';
import { useInputHandlers, useInputParsedProps } from 'components/visual/Inputs/lib/inputs.hook';
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

const WrappedTextAreaInput = React.memo(() => {
  const [get] = usePropStore<TextAreaInputProps>();

  const autoComplete = get('autoComplete');
  const inputValue = get('inputValue') ?? '';
  const loading = get('loading');
  const overflowHidden = get('overflowHidden');
  const rows = get('rows');
  const tiny = get('tiny');
  const value = get('value');

  const { handleChange, handleFocus, handleBlur } = useInputHandlers<TextAreaInputProps>();

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
              {...(!overflowHidden && { multiline: true, rows: rows })}
              autoComplete={autoComplete}
              value={inputValue}
              onChange={e => handleChange(e, e.target.value, e.target.value)}
              onFocus={handleFocus}
              onBlur={e => handleBlur(e, value)}
            />
            <HelperText />
          </>
        )}
      </StyledFormControl>
    </StyledRoot>
  );
});

export const TextAreaInput = ({ autoComplete, rows = 1, preventRender = false, ...props }: TextAreaInputProps) => {
  const parsedProps = useInputParsedProps<string, string, TextAreaInputProps>({
    ...props,
    autoComplete,
    preventRender,
    rows
  });

  return preventRender ? null : (
    <PropProvider<TextAreaInputProps> props={parsedProps}>
      <WrappedTextAreaInput />
    </PropProvider>
  );
};
