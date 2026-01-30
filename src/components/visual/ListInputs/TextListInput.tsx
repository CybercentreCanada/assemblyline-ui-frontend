import type { TextFieldProps } from '@mui/material';
import { Autocomplete, Typography } from '@mui/material';
import { PropProvider, usePropStore } from 'components/core/PropProvider/PropProvider';
import { useValidation } from 'components/visual/Inputs/lib/inputs.hook';
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
  useInputFocus
} from 'components/visual/ListInputs/lib/listinputs.hook';
import type {
  ListInputOptions,
  ListInputRuntimeState,
  ListInputValueModel
} from 'components/visual/ListInputs/lib/listinputs.model';
import { DEFAULT_LIST_INPUT_CONTROLLER_PROPS } from 'components/visual/ListInputs/lib/listinputs.model';
import React from 'react';

export type TextListInputProps = ListInputValueModel<string, string, React.SyntheticEvent<Element, Event>> &
  ListInputOptions & {
    autoComplete?: TextFieldProps['autoComplete'];
    options?: string[] | readonly string[];
  };

type TextListInputController = TextListInputProps & ListInputRuntimeState;

const WrappedTextListInput = React.memo(() => {
  const [get] = usePropStore<TextListInputController>();

  const disabled = get('disabled');
  const id = useInputId();
  const rawValue = get('rawValue') ?? '';
  const loading = get('loading');
  const options = get('options') ?? [];
  const readOnly = get('readOnly');
  const tiny = get('tiny');
  const value = get('value') ?? '';
  const width = get('width');

  const handleBlur = useInputBlur<string>();
  const handleChange = useInputChange<string>();
  const handleFocus = useInputFocus<string>();

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
                inputValue={rawValue}
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
  const { status: validationStatus, message: validationMessage } = useValidation<string>({
    value: value ?? '',
    rawValue: value ?? '',
    ...props
  });

  return preventRender ? null : (
    <PropProvider<TextListInputController>
      initialProps={DEFAULT_LIST_INPUT_CONTROLLER_PROPS as TextListInputController}
      props={{
        autoComplete: 'off',
        options: [],
        preventRender,
        rawValue: value,
        value,
        errorMessage,
        validationStatus,
        validationMessage,
        ...props
      }}
    >
      <WrappedTextListInput />
    </PropProvider>
  );
};

TextListInput.displayName = 'TextListInput';
