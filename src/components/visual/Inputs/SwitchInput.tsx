import { Switch } from '@mui/material';
import { PropProvider, usePropStore } from 'components/core/PropProvider/PropProvider';
import {
  ExpandInputAdornment,
  InputButtonEndAdornment,
  PasswordInputAdornment,
  ResetInputAdornment
} from 'components/visual/Inputs/components/inputs.component.adornment';
import {
  InputButtonFormControlLabel,
  InputButtonLabel,
  InputFormButton
} from 'components/visual/Inputs/components/inputs.component.buttons';
import { InputFormControl, InputHelperText } from 'components/visual/Inputs/components/inputs.component.form';
import {
  useInputClick,
  useInputClickBlur,
  useInputFocus
} from 'components/visual/Inputs/hooks/inputs.hook.event_handlers';
import { useInputId } from 'components/visual/Inputs/hooks/inputs.hook.renderer';
import { useInputValidation } from 'components/visual/Inputs/hooks/inputs.hook.validation';
import type { InputOptions, InputRuntimeState, InputValueModel } from 'components/visual/Inputs/models/inputs.model';
import { DEFAULT_INPUT_CONTROLLER_PROPS } from 'components/visual/Inputs/models/inputs.model';
import { Tooltip } from 'components/visual/Tooltip';
import React from 'react';

export type SwitchInputProps = InputValueModel<boolean, boolean, React.MouseEvent<HTMLButtonElement, MouseEvent>> &
  InputOptions;

type SwitchInputController = SwitchInputProps & InputRuntimeState;

const WrappedSwitchInput = () => {
  const [get] = usePropStore<SwitchInputController>();

  const id = useInputId();
  const loading = get('loading');
  const preventDisabledColor = get('preventDisabledColor');
  const rawValue = Boolean(get('rawValue'));
  const readOnly = get('readOnly');
  const tooltip = get('tooltip');
  const tooltipProps = get('tooltipProps');
  const value = get('value');

  const handleBlur = useInputClickBlur<boolean>();
  const handleClick = useInputClick<boolean>();
  const handleFocus = useInputFocus<boolean>();

  return (
    <Tooltip title={loading ? null : tooltip} {...tooltipProps}>
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
          <PasswordInputAdornment />
          <ResetInputAdornment />
          <ExpandInputAdornment />
        </InputButtonEndAdornment>
      </InputFormControl>
    </Tooltip>
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
