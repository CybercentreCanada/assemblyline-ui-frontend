import { Switch } from '@mui/material';
import { PropProvider, usePropStore } from 'components/core/PropProvider/PropProvider';
import {
  ExpandAdornment,
  HelperText,
  PasswordAdornment,
  ResetAdornment,
  StyledButtonLabel,
  StyledEndAdornmentBox,
  StyledFormButton,
  StyledFormControl,
  StyledFormControlLabel
} from 'components/visual/Inputs/lib/inputs.components';
import {
  useInputClick,
  useInputClickBlur,
  useInputFocus,
  usePropID,
  useValidation
} from 'components/visual/Inputs/lib/inputs.hook';
import type { InputOptions, InputRuntimeState, InputValueModel } from 'components/visual/Inputs/lib/inputs.model';
import { DEFAULT_INPUT_CONTROLLER_PROPS } from 'components/visual/Inputs/lib/inputs.model';
import { Tooltip } from 'components/visual/Tooltip';
import React from 'react';

export type SwitchInputProps = InputValueModel<boolean, boolean, React.MouseEvent<HTMLButtonElement, MouseEvent>> &
  InputOptions;

type SwitchInputController = SwitchInputProps & InputRuntimeState;

const WrappedSwitchInput = () => {
  const [get] = usePropStore<SwitchInputController>();

  const id = usePropID();
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
      <StyledFormControl>
        <StyledFormButton
          onFocus={handleFocus}
          onBlur={e => handleBlur(e, value, value)}
          onClick={e => handleClick(e, !rawValue, !rawValue)}
        >
          <StyledFormControlLabel label={<StyledButtonLabel />}>
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
          </StyledFormControlLabel>
        </StyledFormButton>

        <HelperText />

        <StyledEndAdornmentBox>
          <PasswordAdornment />
          <ResetAdornment />
          <ExpandAdornment />
        </StyledEndAdornmentBox>
      </StyledFormControl>
    </Tooltip>
  );
};

export const SwitchInput = ({ preventRender = false, value, ...props }: SwitchInputProps) => {
  const { status: validationStatus, message: validationMessage } = useValidation<boolean>({
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
