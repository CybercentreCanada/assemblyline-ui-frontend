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
import { useInputHandlers, useInputParsedProps } from 'components/visual/Inputs/lib/inputs.hook';
import type { InputProps, InputValues } from 'components/visual/Inputs/lib/inputs.model';
import { PropProvider, usePropStore } from 'components/visual/Inputs/lib/inputs.provider';
import { Tooltip } from 'components/visual/Tooltip';
import React from 'react';

export type SwitchInputProps = InputValues<boolean, boolean, React.MouseEvent<HTMLButtonElement, MouseEvent>> &
  InputProps;

const WrappedSwitchInput = React.memo(() => {
  const [get] = usePropStore<SwitchInputProps>();

  const inputValue = get('inputValue');
  const loading = get('loading');
  const preventDisabledColor = get('preventDisabledColor');
  const readOnly = get('readOnly');
  const tooltip = get('tooltip');
  const tooltipProps = get('tooltipProps');
  const value = get('value');

  const { handleClick, handleFocus, handleBlur } = useInputHandlers<SwitchInputProps>();

  return (
    <Tooltip title={loading ? null : tooltip} {...tooltipProps}>
      <StyledFormControl>
        <StyledFormButton
          onFocus={handleFocus}
          onBlur={e => handleBlur(e, value)}
          onClick={e => handleClick(e, !(inputValue ?? value), !(inputValue ?? value))}
        >
          <StyledFormControlLabel label={<StyledButtonLabel />}>
            <Switch
              checked={Boolean(inputValue)}
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
});

export const SwitchInput = ({ preventRender = false, ...props }: SwitchInputProps) => {
  const parsedProps = useInputParsedProps<boolean, boolean, SwitchInputProps>({ ...props, preventRender });

  return preventRender ? null : (
    <PropProvider<SwitchInputProps> props={parsedProps}>
      <WrappedSwitchInput />
    </PropProvider>
  );
};
