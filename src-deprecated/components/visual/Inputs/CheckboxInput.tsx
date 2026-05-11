import type { CheckboxProps } from '@mui/material';
import { Checkbox } from '@mui/material';
import { PropProvider, usePropStore } from 'components/core/PropProvider/PropProvider';
import {
  ExpandInputAdornment,
  HelpInputAdornment,
  InputButtonEndAdornment,
  PasswordInputAdornment,
  ProgressInputAdornment,
  ResetInputAdornment
} from 'components/visual/Inputs/components/inputs.component.adornment';
import {
  InputButtonFormControlLabel,
  InputButtonLabel,
  InputFormButton,
  InputFormButtonTooltip
} from 'components/visual/Inputs/components/inputs.component.buttons';
import { InputFormControl, InputHelperText } from 'components/visual/Inputs/components/inputs.component.form';
import {
  useInputClick,
  useInputClickBlur,
  useInputFocus
} from 'components/visual/Inputs/hooks/inputs.hook.event_handlers';
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

export type CheckboxInputProps = InputValueModel<boolean, React.MouseEvent<HTMLButtonElement, MouseEvent>> &
  InputOptions &
  InputSlotProps & {
    indeterminate?: CheckboxProps['indeterminate'];
  };

type CheckboxInputController = CheckboxInputProps & InputRuntimeState<boolean>;

const WrappedCheckboxInput = () => {
  const [get] = usePropStore<CheckboxInputController>();

  const endAdornment = get('endAdornment');
  const id = useInputId();
  const indeterminate = get('indeterminate');
  const preventDisabledColor = get('preventDisabledColor');
  const rawValue = Boolean(get('rawValue'));
  const readOnly = get('readOnly');
  const value = get('value');

  const handleBlur = useInputClickBlur<boolean>();
  const handleClick = useInputClick<boolean>();
  const handleFocus = useInputFocus<boolean>();

  return (
    <InputFormButtonTooltip>
      <InputFormControl>
        <InputFormButton
          onBlur={e => handleBlur(e, value, rawValue)}
          onFocus={handleFocus}
          onClick={e => handleClick(e, !rawValue)}
        >
          <InputButtonFormControlLabel label={<InputButtonLabel />}>
            <Checkbox
              name={id}
              checked={rawValue}
              indeterminate={indeterminate}
              disableFocusRipple
              disableRipple
              disableTouchRipple
              size="small"
              sx={{
                paddingTop: '0px',
                paddingBottom: '0px',
                minWidth: '40px',
                ...((preventDisabledColor || readOnly) && { color: 'inherit !important' })
              }}
            />
          </InputButtonFormControlLabel>
        </InputFormButton>

        <InputHelperText />

        <InputButtonEndAdornment>
          {endAdornment}
          <HelpInputAdornment />
          <PasswordInputAdornment />
          <ProgressInputAdornment />
          <ResetInputAdornment />
          <ExpandInputAdornment />
        </InputButtonEndAdornment>
      </InputFormControl>
    </InputFormButtonTooltip>
  );
};

export const CheckboxInput = ({ preventRender = false, value, ...props }: CheckboxInputProps) => {
  const { status: validationStatus, message: validationMessage } = useInputValidation<boolean>({
    value: Boolean(value),
    ...props
  });

  return preventRender ? null : (
    <PropProvider<CheckboxInputController>
      initialProps={DEFAULT_INPUT_CONTROLLER_PROPS as CheckboxInputController}
      props={{
        indeterminate: false,
        rawValue: value,
        validationMessage,
        validationStatus,
        value,
        ...props
      }}
    >
      <WrappedCheckboxInput />
    </PropProvider>
  );
};
