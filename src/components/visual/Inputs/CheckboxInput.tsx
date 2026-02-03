import type { CheckboxProps } from '@mui/material';
import { Checkbox } from '@mui/material';
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

export type CheckboxInputProps = InputValueModel<boolean, boolean, React.MouseEvent<HTMLButtonElement, MouseEvent>> &
  InputOptions & {
    indeterminate?: CheckboxProps['indeterminate'];
  };

type CheckboxInputController = CheckboxInputProps & InputRuntimeState;

const WrappedCheckboxInput = () => {
  const [get] = usePropStore<CheckboxInputController>();

  const id = useInputId();
  const indeterminate = get('indeterminate');
  const rawValue = Boolean(get('rawValue'));
  const loading = get('loading');
  const preventDisabledColor = get('preventDisabledColor');
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
          onBlur={e => handleBlur(e, value, value)}
          onFocus={handleFocus}
          onClick={e => handleClick(e, !rawValue, !rawValue)}
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
          <PasswordInputAdornment />
          <ResetInputAdornment />
          <ExpandInputAdornment />
        </InputButtonEndAdornment>
      </InputFormControl>
    </Tooltip>
  );
};

export const CheckboxInput = ({ preventRender = false, value, ...props }: CheckboxInputProps) => {
  const { status: validationStatus, message: validationMessage } = useInputValidation<boolean>({
    value: Boolean(value),
    rawValue: Boolean(value),
    ...props
  });

  return preventRender ? null : (
    <PropProvider<CheckboxInputController>
      initialProps={DEFAULT_INPUT_CONTROLLER_PROPS as CheckboxInputController}
      props={{
        indeterminate: false,
        rawValue: value,
        value,
        validationMessage,
        validationStatus,
        ...props
      }}
    >
      <WrappedCheckboxInput />
    </PropProvider>
  );
};
