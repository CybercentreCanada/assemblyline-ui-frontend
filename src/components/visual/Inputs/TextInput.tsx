import type { TextFieldProps } from '@mui/material';
import { Autocomplete, Typography } from '@mui/material';
import {
  HelperText,
  StyledFormControl,
  StyledFormLabel,
  StyledInputSkeleton,
  StyledRoot,
  StyledTextField
} from 'components/visual/Inputs/lib/inputs.components';
import {
  useErrorMessage,
  useInputBlur,
  useInputChange,
  useInputFocus,
  usePropID
} from 'components/visual/Inputs/lib/inputs.hook';
import type { InputProps, InputValues } from 'components/visual/Inputs/lib/inputs.model';
import { PropProvider, usePropStore } from 'components/visual/Inputs/lib/inputs.provider';
import React from 'react';

export type TextInputProps = InputValues<string, string, React.SyntheticEvent<Element, Event>> &
  InputProps & {
    autoComplete?: TextFieldProps['autoComplete'];
    options?: string[] | readonly string[];
  };

const WrappedTextInput = () => {
  const [get] = usePropStore<TextInputProps>();

  const disabled = get('disabled');
  const id = usePropID();
  const inputValue = get('inputValue') ?? '';
  const loading = get('loading');
  const options = get('options') ?? [];
  const readOnly = get('readOnly');
  const tiny = get('tiny');
  const value = get('value') ?? '';

  const handleBlur = useInputBlur<TextInputProps>();
  const handleChange = useInputChange<TextInputProps>();
  const handleFocus = useInputFocus<TextInputProps>();

  useErrorMessage();

  return (
    <StyledRoot>
      <StyledFormLabel />
      <StyledFormControl>
        {loading ? (
          <StyledInputSkeleton />
        ) : (
          <Autocomplete
            disableClearable
            disabled={disabled}
            freeSolo
            fullWidth
            id={id}
            inputValue={inputValue}
            options={options}
            readOnly={readOnly}
            size="small"
            value={value}
            onInputChange={(e, v) => handleChange(e, v, v)}
            onFocus={handleFocus}
            onBlur={e => handleBlur(e, value, value)}
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

export const TextInput = ({ preventRender = false, value, ...props }: TextInputProps) =>
  preventRender ? null : (
    <PropProvider<TextInputProps>
      props={{ autoComplete: 'off', options: [], preventRender, inputValue: value, value, ...props }}
    >
      <WrappedTextInput />
    </PropProvider>
  );
