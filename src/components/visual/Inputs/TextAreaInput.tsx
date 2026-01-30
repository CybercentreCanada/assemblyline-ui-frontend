import type { TextFieldProps } from '@mui/material';
import { Skeleton } from '@mui/material';
import { PropProvider, usePropStore } from 'components/core/PropProvider/PropProvider';
import type { StyledTextFieldProps } from 'components/visual/Inputs/lib/inputs.components';
import {
  HelperText,
  StyledFormControl,
  StyledFormLabel,
  StyledRoot,
  StyledTextField
} from 'components/visual/Inputs/lib/inputs.components';
import { useInputBlur, useInputChange, useInputFocus, useValidation } from 'components/visual/Inputs/lib/inputs.hook';
import type { InputOptions, InputRuntimeState, InputValueModel } from 'components/visual/Inputs/lib/inputs.model';
import { DEFAULT_INPUT_CONTROLLER_PROPS } from 'components/visual/Inputs/lib/inputs.model';
import React from 'react';

export type TextAreaInputProps = InputValueModel<
  string,
  string,
  React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
> &
  InputOptions & {
    autoComplete?: StyledTextFieldProps['autoComplete'];
    rows?: TextFieldProps['rows'];
    minRows?: TextFieldProps['minRows'];
    maxRows?: TextFieldProps['maxRows'];
  };

type TextAreaInputController = TextAreaInputProps & InputRuntimeState;

const WrappedTextAreaInput = () => {
  const [get] = usePropStore<TextAreaInputController>();

  const autoComplete = get('autoComplete');
  const rawValue = get('rawValue') ?? '';
  const loading = get('loading');
  const maxRows = get('maxRows');
  const minRows = get('minRows');
  const overflowHidden = get('overflowHidden');
  const password = get('password');
  const rows = get('rows');
  const isPasswordVisible = get('isPasswordVisible');
  const tiny = get('tiny');
  const value = get('value');

  const handleBlur = useInputBlur<string>();
  const handleChange = useInputChange<string>();
  const handleFocus = useInputFocus<string>();

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
              {...(!(overflowHidden || (password && isPasswordVisible)) && {
                multiline: true,
                ...(minRows || maxRows ? { minRows, maxRows } : { rows: rows || 1 })
              })}
              autoComplete={autoComplete}
              value={rawValue}
              onChange={e => handleChange(e, e.target.value, e.target.value)}
              onFocus={handleFocus}
              onBlur={e => handleBlur(e, value, value)}
            />
            <HelperText />
          </>
        )}
      </StyledFormControl>
    </StyledRoot>
  );
};

export const TextAreaInput = ({ preventRender = false, value, ...props }: TextAreaInputProps) => {
  const { status: validationStatus, message: validationMessage } = useValidation<string>({
    value: value ?? '',
    rawValue: value ?? '',
    ...props
  });

  return preventRender ? null : (
    <PropProvider<TextAreaInputController>
      initialProps={DEFAULT_INPUT_CONTROLLER_PROPS as TextAreaInputController}
      props={{
        autoComplete: 'off',
        rawValue: value,
        maxRows: null,
        minRows: null,
        preventRender,
        validationMessage,
        validationStatus,
        rows: null,
        value,
        ...props
      }}
    >
      <WrappedTextAreaInput />
    </PropProvider>
  );
};
