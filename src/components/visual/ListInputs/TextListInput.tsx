import type { TextFieldProps } from '@mui/material';
import { Autocomplete, Typography } from '@mui/material';
import { useErrorCallback } from 'components/visual/Inputs/lib/inputs.hook';
import {
  StyledHelperText,
  StyledListInputInner,
  StyledListInputLoading,
  StyledListInputText,
  StyledListInputWrapper,
  StyledListItemRoot,
  StyledPasswordAdornment,
  StyledResetAdornment,
  StyledTextField
} from 'components/visual/ListInputs/lib/listinputs.components';
import {
  useInputBlur,
  useInputChange,
  useInputFocus,
  usePropID
} from 'components/visual/ListInputs/lib/listinputs.hook';
import type { ListInputProps, ListInputValues } from 'components/visual/ListInputs/lib/listinputs.model';
import { PropProvider, usePropStore } from 'components/visual/ListInputs/lib/listinputs.provider';
import React from 'react';

export type TextListInputProps = ListInputValues<string, string, React.SyntheticEvent<Element, Event>> &
  ListInputProps & {
    autoComplete?: TextFieldProps['autoComplete'];
    options?: string[] | readonly string[];
  };

const WrappedTextListInput = React.memo(() => {
  const [get] = usePropStore<TextListInputProps>();

  const disabled = get('disabled');
  const id = usePropID();
  const inputValue = get('inputValue') ?? '';
  const loading = get('loading');
  const options = get('options') ?? [];
  const readOnly = get('readOnly');
  const tiny = get('tiny');
  const value = get('value') ?? '';
  const width = get('width');

  const handleBlur = useInputBlur<TextListInputProps>();
  const handleChange = useInputChange<TextListInputProps>();
  const handleFocus = useInputFocus<TextListInputProps>();

  return (
    <StyledListItemRoot>
      <StyledListInputWrapper>
        <StyledListInputInner>
          <StyledListInputText />

          {loading ? (
            <StyledListInputLoading />
          ) : (
            <>
              <StyledPasswordAdornment />
              <StyledResetAdornment />
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
                sx={{ maxWidth: width, minWidth: width }}
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
            </>
          )}
        </StyledListInputInner>

        <StyledHelperText />
      </StyledListInputWrapper>
    </StyledListItemRoot>
  );
});

export const TextListInput = ({ preventRender = false, value, ...props }: TextListInputProps) => {
  const errorMessage = useErrorCallback({ preventRender, value, ...props });

  return preventRender ? null : (
    <PropProvider<TextListInputProps>
      props={{ autoComplete: 'off', options: [], preventRender, inputValue: value, value, errorMessage, ...props }}
    >
      <WrappedTextListInput />
    </PropProvider>
  );
};

TextListInput.displayName = 'TextListInput';
