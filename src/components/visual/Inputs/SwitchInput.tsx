import { Switch } from '@mui/material';
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

export type SwitchInputProps = InputValueModel<boolean, boolean, React.MouseEvent<HTMLButtonElement, MouseEvent>> &
  InputOptions &
  InputSlotProps;

type SwitchInputController = SwitchInputProps & InputRuntimeState;

const WrappedSwitchInput = () => {
  const [get] = usePropStore<SwitchInputController>();

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
          onBlur={e => handleBlur(e, value, value)}
          onClick={e => handleClick(e, !rawValue, !rawValue)}
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
    rawValue: Boolean(value),
    ...props
  });

  return preventRender ? null : (
    <PropProvider<SwitchInputController>
      initialProps={DEFAULT_INPUT_CONTROLLER_PROPS as SwitchInputController}
      props={{ preventRender, rawValue: value, value, validationStatus, validationMessage, ...props }}
    >
      <WrappedSwitchInput />
    </PropProvider>
  );
};
