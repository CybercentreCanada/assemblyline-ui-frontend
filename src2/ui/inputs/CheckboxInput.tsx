import type { CheckboxProps } from '@mui/material';
import { Checkbox } from '@mui/material';
import { PropProvider, usePropStore } from 'features/prop-provider/PropProvider';
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
import {
  useInputClick,
  useInputClickBlur,
  useInputFocus
} from 'ui/inputs/hooks/inputs.hook.event_handlers';
import { useInputId } from 'ui/inputs/hooks/inputs.hook.renderer';
import { useInputValidation } from 'ui/inputs/hooks/inputs.hook.validation';
import type {
  InputOptions,
  InputRuntimeState,
  InputSlotProps,
  InputValueModel
} from 'ui/inputs/models/inputs.model';
import { DEFAULT_INPUT_CONTROLLER_PROPS } from 'ui/inputs/models/inputs.model';
import type { MouseEvent } from 'react';

export type CheckboxInputProps = InputValueModel<boolean, MouseEvent<HTMLButtonElement, globalThis.MouseEvent>> &
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
