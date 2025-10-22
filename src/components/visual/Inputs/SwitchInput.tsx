import { Switch } from '@mui/material';
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
  useErrorCallback,
  useInputBlur,
  useInputClick,
  useInputFocus,
  usePropID
} from 'components/visual/Inputs/lib/inputs.hook';
import type { InputProps, InputValues } from 'components/visual/Inputs/lib/inputs.model';
import { PropProvider, usePropStore } from 'components/visual/Inputs/lib/inputs.provider';
import { Tooltip } from 'components/visual/Tooltip';
import React from 'react';

export type SwitchInputProps = InputValues<boolean, boolean, React.MouseEvent<HTMLButtonElement, MouseEvent>> &
  InputProps;

const WrappedSwitchInput = () => {
  const [get] = usePropStore<SwitchInputProps>();

  const id = usePropID();
  const inputValue = Boolean(get('inputValue'));
  const loading = get('loading');
  const preventDisabledColor = get('preventDisabledColor');
  const readOnly = get('readOnly');
  const tooltip = get('tooltip');
  const tooltipProps = get('tooltipProps');
  const value = get('value');

  const handleBlur = useInputBlur<SwitchInputProps>();
  const handleClick = useInputClick<SwitchInputProps>();
  const handleFocus = useInputFocus<SwitchInputProps>();

  return (
    <Tooltip title={loading ? null : tooltip} {...tooltipProps}>
      <StyledFormControl>
        <StyledFormButton
          onFocus={handleFocus}
          onBlur={e => handleBlur(e, value, value)}
          onClick={e => handleClick(e, !inputValue, !inputValue)}
        >
          <StyledFormControlLabel label={<StyledButtonLabel />}>
            <Switch
              name={id}
              checked={inputValue}
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
  const errorMessage = useErrorCallback({ preventRender, value, ...props });

  return preventRender ? null : (
    <PropProvider<SwitchInputProps> props={{ preventRender, inputValue: value, value, errorMessage, ...props }}>
      <WrappedSwitchInput />
    </PropProvider>
  );
};
