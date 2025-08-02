import { Switch } from '@mui/material';
import {
  ExpandInput,
  HelperText,
  PasswordInput,
  ResetInput,
  StyledButtonLabel,
  StyledEndAdornmentBox,
  StyledFormButton,
  StyledFormControl,
  StyledFormControlLabel
} from 'components/visual/Inputs/lib/inputs.components';
import { useDefaultError, useDefaultHandlers } from 'components/visual/Inputs/lib/inputs.hook';
import type { InputProps, InputValues } from 'components/visual/Inputs/lib/inputs.model';
import { PropProvider, usePropStore } from 'components/visual/Inputs/lib/inputs.provider';
import { Tooltip } from 'components/visual/Tooltip';
import React from 'react';

export type SwitchInputProps = InputValues<boolean> & InputProps;

const WrappedSwitchInput = () => {
  const [get] = usePropStore<SwitchInputProps>();

  const inputValue = get(s => s.inputValue);
  const loading = get(s => s.loading);
  const preventDisabledColor = get(s => s.preventDisabledColor);
  const readOnly = get(s => s.readOnly);
  const tooltip = get(s => s.tooltip);
  const tooltipProps = get(s => s.tooltipProps);
  const value = get(s => s.value);

  const { handleClick, handleFocus, handleBlur } = useDefaultHandlers();

  return (
    <Tooltip title={loading ? null : tooltip} {...tooltipProps}>
      <StyledFormControl>
        <StyledFormButton
          onFocus={handleFocus}
          onBlur={handleBlur}
          onClick={e => handleClick(e, !(inputValue ?? value), !(inputValue ?? value))}
        >
          <StyledFormControlLabel label={<StyledButtonLabel />}>
            <Switch
              checked={Boolean(inputValue ?? value)}
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
          <PasswordInput />
          <ResetInput />
          <ExpandInput />
        </StyledEndAdornmentBox>
      </StyledFormControl>
    </Tooltip>
  );
};

export const SwitchInput: React.FC<SwitchInputProps> = React.memo(({ value, preventRender = false, ...props }) => {
  const newError = useDefaultError(props);

  return preventRender ? null : (
    <PropProvider<SwitchInputProps> data={{ ...props, error: newError, errorMsg: newError(value), value }}>
      <WrappedSwitchInput />
    </PropProvider>
  );
});
