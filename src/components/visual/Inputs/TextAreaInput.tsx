import type { TextFieldProps } from '@mui/material';
import { Skeleton } from '@mui/material';
import { PropProvider, usePropStore } from 'components/core/PropProvider/PropProvider';
import {
  InputFormControl,
  InputFormLabel,
  InputHelperText,
  InputRoot
} from 'components/visual/Inputs/components/inputs.component.form';
import type { InputTextFieldProps } from 'components/visual/Inputs/components/inputs.component.textfield';
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

export type TextAreaInputProps = InputValueModel<
  string,
  string,
  React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
> &
  InputOptions &
  InputSlotProps & {
    autoComplete?: InputTextFieldProps['autoComplete'];
    rows?: TextFieldProps['rows'];
    minRows?: TextFieldProps['minRows'];
    maxRows?: TextFieldProps['maxRows'];
  };

type TextAreaInputController = TextAreaInputProps & InputRuntimeState;

const WrappedTextAreaInput = () => {
  const [get] = usePropStore<TextAreaInputController>();

  const autoComplete = get('autoComplete');
  const id = useInputId();
  const isPasswordVisible = get('isPasswordVisible');
  const loading = get('loading');
  const maxRows = get('maxRows');
  const minRows = get('minRows');
  const overflowHidden = get('overflowHidden');
  const password = get('password');
  const rawValue = get('rawValue') ?? '';
  const rows = get('rows');
  const tiny = get('tiny');
  const value = get('value');

  const handleBlur = useInputBlur<string>();
  const handleChange = useInputChange<string>();
  const handleFocus = useInputFocus<string>();

  const skeletonRows = rows ?? minRows ?? maxRows ?? 1;

  return (
    <InputRoot>
      <InputFormLabel />
      <InputFormControl>
        {loading ? (
          <Skeleton
            sx={{ height: `calc(23px * ${skeletonRows} + 17px)`, transform: 'unset', ...(tiny && { height: '28px' }) }}
          />
        ) : (
          <>
            <InputTextField
              {...(!(overflowHidden || (password && isPasswordVisible)) && {
                multiline: true,
                ...(minRows || maxRows ? { minRows, maxRows } : { rows: rows || 1 })
              })}
              autoComplete={autoComplete}
              id={id}
              value={rawValue}
              onChange={e => handleChange(e, e.target.value, e.target.value)}
              onFocus={handleFocus}
              onBlur={e => handleBlur(e, value, value)}
            />
            <InputHelperText />
          </>
        )}
      </InputFormControl>
    </InputRoot>
  );
};

export const TextAreaInput = ({ preventRender = false, value, ...props }: TextAreaInputProps) => {
  const { status: validationStatus, message: validationMessage } = useInputValidation<string>({
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
