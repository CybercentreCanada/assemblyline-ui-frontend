import type { AutocompleteProps } from '@mui/material';
import { Autocomplete, Typography } from '@mui/material';
import {
  HelperText,
  StyledFormControl,
  StyledFormLabel,
  StyledInputSkeleton,
  StyledRoot,
  StyledTextField
} from 'components/visual/Inputs/lib/inputs.components';
import { useInputHandlers, useInputParsedProps } from 'components/visual/Inputs/lib/inputs.hook';
import type { InputProps, InputValues } from 'components/visual/Inputs/lib/inputs.model';
import { PropProvider, usePropStore } from 'components/visual/Inputs/lib/inputs.provider';
import type { ElementType } from 'react';
import React from 'react';

export type TextInputProps = InputValues<string> &
  InputProps & {
    autoComplete?: AutocompleteProps<string, boolean, boolean, boolean, ElementType>['autoComplete'];
    options?: string[];
  };

const WrappedTextInput = React.memo(() => {
  const [get] = usePropStore<TextInputProps>();

  const autoComplete = get('autoComplete');
  const disabled = get('disabled');
  const id = get('id');
  const inputValue = get('inputValue');
  const loading = get('loading');
  const options = get('options');
  const readOnly = get('readOnly');
  const tiny = get('tiny');
  const value = get('value');

  const { handleChange, handleFocus, handleBlur } = useInputHandlers<TextInputProps>();

  return (
    <StyledRoot>
      <StyledFormLabel />
      <StyledFormControl>
        {loading ? (
          <StyledInputSkeleton />
        ) : (
          <Autocomplete
            id={id}
            autoComplete={autoComplete}
            disableClearable
            disabled={disabled}
            freeSolo
            fullWidth
            readOnly={readOnly}
            size="small"
            options={options}
            value={value}
            inputValue={inputValue}
            onInputChange={(e, v) => handleChange(e, v, v)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            renderOption={(props, option, { index }) => (
              <Typography {...props} key={`${option}-${index}`} variant={tiny ? 'body2' : 'body1'}>
                {option}
              </Typography>
            )}
            renderInput={params => <StyledTextField params={params} />}
          />
        )}
        <HelperText />
      </StyledFormControl>
    </StyledRoot>
  );
});

export const TextInput = ({
  autoComplete = false,
  options = [],
  preventRender = false,
  value = '',
  ...props
}: TextInputProps) => {
  const parsedProps = useInputParsedProps({ ...props, autoComplete, options, preventRender, value });

  return preventRender ? null : (
    <PropProvider<TextInputProps> props={parsedProps}>
      <WrappedTextInput />
    </PropProvider>
  );
};
