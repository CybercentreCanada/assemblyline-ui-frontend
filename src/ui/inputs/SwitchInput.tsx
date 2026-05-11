import { Switch } from '@mui/material';
import { PropProvider, usePropStore } from 'features/prop-provider/PropProvider';
import React from 'react';
import {
  ExpandInputAdornment,
  HelpInputAdornment,
  InputButtonEndAdornment,
  PasswordInputAdornment,
  ProgressInputAdornment,
  ResetInputAdornment
} from 'ui/inputs/components/inputs.component.adornment';
import {
  InputButtonFormControlLabel,
  InputButtonLabel,
  InputFormButton,
  InputFormButtonTooltip
} from 'ui/inputs/components/inputs.component.buttons';
import { InputFormControl, InputHelperText } from 'ui/inputs/components/inputs.component.form';
import { useInputClick, useInputClickBlur, useInputFocus } from 'ui/inputs/hooks/inputs.hook.event_handlers';
import { useInputId } from 'ui/inputs/hooks/inputs.hook.renderer';
import { useInputValidation } from 'ui/inputs/hooks/inputs.hook.validation';
import type { InputOptions, InputRuntimeState, InputSlotProps, InputValueModel } from 'ui/inputs/models/inputs.model';
import { DEFAULT_INPUT_CONTROLLER_PROPS } from 'ui/inputs/models/inputs.model';

export type SwitchInputProps = InputValueModel<boolean, React.MouseEvent<HTMLButtonElement, MouseEvent>> &
  InputOptions &
  InputSlotProps;

type SwitchInputController = SwitchInputProps & InputRuntimeState<boolean>;

const WrappedSwitchInput = () => {
  const [get] = usePropStore<SwitchInputController>();

  const endAdornment = get('endAdornment');
  const id = useInputId();
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
          onFocus={handleFocus}
          onBlur={e => handleBlur(e, value, rawValue)}
          onClick={e => handleClick(e, !rawValue)}
        >
          <InputButtonFormControlLabel label={<InputButtonLabel />}>
            <Switch
              name={id}
              checked={rawValue}
              disableFocusRipple
              disableRipple
              disableTouchRipple
              size="small"
              sx={{
                minWidth: '40px',
                '& .Mui-disabled': {
                  ...((preventDisabledColor || readOnly) && { color: 'inherit !important' })
                }
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

export const SwitchInput = ({ preventRender = false, value, ...props }: SwitchInputProps) => {
  const { status: validationStatus, message: validationMessage } = useInputValidation<boolean>({
    value: Boolean(value),
    ...props
  });

  return preventRender ? null : (
    <PropProvider<SwitchInputController>
      initialProps={DEFAULT_INPUT_CONTROLLER_PROPS as SwitchInputController}
      props={{ preventRender, rawValue: Boolean(value), value, validationStatus, validationMessage, ...props }}
    >
      <WrappedSwitchInput />
    </PropProvider>
  );
};
