import type { TextFieldProps } from '@mui/material';
import { Autocomplete, Typography } from '@mui/material';
import { PropProvider, usePropStore } from 'components/core/PropProvider/PropProvider';
import {
  HelpInputAdornment,
  PasswordInputAdornment,
  ProgressInputAdornment,
  ResetInputAdornment
} from 'components/visual/Inputs/components/inputs.component.adornment';
import { InputHelperText } from 'components/visual/Inputs/components/inputs.component.form';
import { useInputBlur, useInputChange, useInputFocus } from 'components/visual/Inputs/hooks/inputs.hook.event_handlers';
import { useInputId } from 'components/visual/Inputs/hooks/inputs.hook.renderer';
import { useInputValidation } from 'components/visual/Inputs/hooks/inputs.hook.validation';
import type { InputRuntimeState, InputValueModel } from 'components/visual/Inputs/models/inputs.model';
import {
  ListInputInner,
  ListInputLoading,
  ListInputRoot,
  ListInputText,
  ListInputTextField,
  ListInputWrapper
} from 'components/visual/ListInputs/lib/listinputs.components';
import type { ListInputOptions, ListInputSlotProps } from 'components/visual/ListInputs/lib/listinputs.model';
import { DEFAULT_LIST_INPUT_CONTROLLER_PROPS } from 'components/visual/ListInputs/lib/listinputs.model';
import React from 'react';

export type TextListInputProps = InputValueModel<string, React.SyntheticEvent<Element, Event>> &
  ListInputOptions &
  ListInputSlotProps & {
    autoComplete?: TextFieldProps['autoComplete'];
    options?: string[] | readonly string[];
  };

type TextListInputController = TextListInputProps & InputRuntimeState<string>;

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
    <ListInputRoot>
      <ListInputWrapper>
        <ListInputInner>
          <ListInputText />

          {loading ? (
            <ListInputLoading />
          ) : (
            <>
              <HelpInputAdornment />
              <PasswordInputAdornment />
              <ProgressInputAdornment />
              <ResetInputAdornment />
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
                onInputChange={(e, v) => handleChange(e, v, rawValue)}
                onFocus={handleFocus}
                onBlur={e => handleBlur(e, value, rawValue)}
                renderOption={(props, option, { index }) => (
                  <Typography {...props} key={`${option}-${index}`} variant={tiny ? 'body2' : 'body1'}>
                    {option}
                  </Typography>
                )}
                renderInput={params => <ListInputTextField params={params} />}
              />
            </>
          )}
        </ListInputInner>

        <InputHelperText sx={{ width: '100%', justifyContent: 'flex-end', margin: 0 }} />
      </ListInputWrapper>
    </ListInputRoot>
  );
});

export const TextListInput = ({ preventRender = false, value, ...props }: TextListInputProps) => {
  const { status: validationStatus, message: validationMessage } = useInputValidation<string>({
    value: value ?? '',
    ...props
  });

  return preventRender ? null : (
    <PropProvider<TextListInputController>
      initialProps={DEFAULT_LIST_INPUT_CONTROLLER_PROPS as TextListInputController}
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
      <WrappedTextListInput />
    </PropProvider>
  );
};

TextListInput.displayName = 'TextListInput';
