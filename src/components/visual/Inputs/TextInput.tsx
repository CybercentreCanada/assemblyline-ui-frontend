import type { TextFieldProps } from '@mui/material';
import { Autocomplete, Typography } from '@mui/material';
import { PropProvider, usePropStore } from 'components/core/PropProvider/PropProvider';
import {
  InputFormControl,
  InputFormLabel,
  InputHelperText,
  InputRoot,
  InputSkeleton
} from 'components/visual/Inputs/components/inputs.component.form';
import { InputTextField } from 'components/visual/Inputs/components/inputs.component.textfield';
import { useInputBlur, useInputChange, useInputFocus } from 'components/visual/Inputs/hooks/inputs.hook.event_handlers';
import { useInputId } from 'components/visual/Inputs/hooks/inputs.hook.renderer';
import { useInputValidation } from 'components/visual/Inputs/hooks/inputs.hook.validation';
import type {
  InputOptions,
  InputRuntimeState,
  InputSlotProps,
  InputValueModel
} from 'components/visual/Inputs/models/inputs.model';
import { DEFAULT_INPUT_CONTROLLER_PROPS } from 'components/visual/Inputs/models/inputs.model';
import React from 'react';

export type TextInputProps = InputValueModel<string, React.SyntheticEvent<Element, Event>> &
  InputOptions &
  InputSlotProps & {
    autoComplete?: TextFieldProps['autoComplete'];
    options?: string[] | readonly string[];
  };

type TextInputController = TextInputProps & InputRuntimeState<string>;

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
    <InputRoot>
      <InputFormLabel />
      <InputFormControl>
        {loading ? (
          <InputSkeleton />
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
            onInputChange={(e, v) => handleChange(e, v)}
            onFocus={handleFocus}
            onBlur={e => handleBlur(e, value)}
            renderOption={(props, option, { index }) => (
              <Typography {...props} key={`${option}-${index}`} variant={tiny ? 'body2' : 'body1'}>
                {option}
              </Typography>
            )}
            renderInput={params => <InputTextField params={params} />}
          />
        )}
        <InputHelperText />
      </InputFormControl>
    </InputRoot>
  );
};

export const TextInput = ({ preventRender = false, value, ...props }: TextInputProps) => {
  const { status: validationStatus, message: validationMessage } = useInputValidation<string>({
    value: value ?? '',
    ...props
  });

  return preventRender ? null : (
    <PropProvider<TextInputController>
      initialProps={DEFAULT_INPUT_CONTROLLER_PROPS as TextInputController}
      props={{
        autoComplete: 'off',
        options: [],
        preventRender,
        rawValue: value ?? '',
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
