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
import { useDefaultError, useDefaultHandlers } from 'components/visual/Inputs/lib/inputs.hook';
import type { InputProps, InputValues } from 'components/visual/Inputs/lib/inputs.model';
import { PropProvider, usePropStore } from 'components/visual/Inputs/lib/inputs.provider';
import type { ElementType } from 'react';
import React from 'react';

export type TextInputProps = InputValues<string> &
  InputProps & {
    autoComplete?: AutocompleteProps<string, boolean, boolean, boolean, ElementType>['autoComplete'];
    options?: AutocompleteProps<string, boolean, boolean, boolean, ElementType>['options'];
  };

const WrappedTextInput = () => {
  const [get] = usePropStore<TextInputProps>();

  const autoComplete = get(s => s.autoComplete);
  const disabled = get(s => s.disabled);
  const id = get(s => s.id);
  const inputValue = get(s => s.inputValue);
  const loading = get(s => s.loading);
  const options = get(s => s.options);
  const readOnly = get(s => s.readOnly);
  const tiny = get(s => s.tiny);
  const value = get(s => s.value);

  const { handleChange, handleFocus, handleBlur } = useDefaultHandlers();

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
            options={options ?? []}
            value={value ?? ''}
            inputValue={inputValue ?? value ?? ''}
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
};

export const TextInput: React.FC<TextInputProps> = React.memo(
  ({ autoComplete = false, options = [], preventRender = false, value, ...props }) => {
    const newError = useDefaultError(props);

    return preventRender ? null : (
      <PropProvider<TextInputProps>
        data={{
          ...props,
          autoComplete,
          error: newError,
          errorMsg: newError(value),
          options,
          value
        }}
      >
        <WrappedTextInput />
      </PropProvider>
    );
  }
);
