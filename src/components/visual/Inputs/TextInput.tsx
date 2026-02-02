import type { TextFieldProps } from '@mui/material';
import { Autocomplete, Typography } from '@mui/material';
import { PropProvider, usePropStore } from 'components/core/PropProvider/PropProvider';
import {
  useInputBlur,
  useInputChange,
  useInputFocus,
  useInputId,
  useValidation
} from 'components/visual/Inputs/hooks/inputs.hook';
import {components/visual/Inputs/components/inputs.components
  HelperText,
  StyledFormControl,
  StyledFormLabel,
  StyledInputSkeleton,
  StyledRoot,
  StyledTextField
} from 'components/visual/Inputs/lib/inputs.components';
import type { InputOptions, InputRuntimeState, InputValueModel } from 'components/visual/Inputs/models/inputs.model';
import { DEFAULT_INPUT_CONTROLLER_PROPS } from 'components/visual/Inputs/models/inputs.model';
import React from 'react';

export type TextInputProps = InputValueModel<string, string, React.SyntheticEvent<Element, Event>> &
  InputOptions & {
    autoComplete?: TextFieldProps['autoComplete'];
    options?: string[] | readonly string[];
  };

type TextInputController = TextInputProps & InputRuntimeState;

const WrappedTextInput = () => {
  const [get] = usePropStore<TextInputController>();

  const disabled = get('disabled');
  const id = useInputId();
  const rawValue = get('rawValue') ?? '';
  const loading = get('loading');
  const options = get('options') ?? [];
  const readOnly = get('readOnly');
  const tiny = get('tiny');
  const value = get('value') ?? '';

  const handleBlur = useInputBlur<string>();
  const handleChange = useInputChange<string>();
  const handleFocus = useInputFocus<string>();

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
            inputValue={rawValue}
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

export const TextInput = ({ preventRender = false, value, ...props }: TextInputProps) => {
  const { status: validationStatus, message: validationMessage } = useValidation<string>({
    value: value ?? '',
    rawValue: value ?? '',
    ...props
  });

  return preventRender ? null : (
    <PropProvider<TextInputController>
      initialProps={DEFAULT_INPUT_CONTROLLER_PROPS as TextInputController}
      props={{
        autoComplete: 'off',
        rawValue: value,
        options: [],
        preventRender,
        validationMessage,
        validationStatus,
        value,
        ...props
      }}
    >
      <WrappedTextInput />
    </PropProvider>
  );
};
