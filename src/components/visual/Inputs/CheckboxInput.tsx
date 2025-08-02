import type { CheckboxProps } from '@mui/material';
import { Checkbox } from '@mui/material';
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

export type CheckboxInputProps = InputValues<boolean> &
  InputProps & {
    indeterminate?: CheckboxProps['indeterminate'];
  };

const WrappedCheckboxInput = () => {
  const [get] = usePropStore<CheckboxInputProps>();

  const indeterminate = get(s => s.indeterminate);
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
          onBlur={handleBlur}
          onFocus={handleFocus}
          onClick={e => handleClick(e, !(inputValue ?? value), !(inputValue ?? value))}
        >
          <StyledFormControlLabel label={<StyledButtonLabel />}>
            <Checkbox
              checked={Boolean(inputValue ?? value)}
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

export const CheckboxInput: React.FC<CheckboxInputProps> = React.memo(
  ({ indeterminate = false, preventRender = false, value, ...props }) => {
    const newError = useDefaultError(props);

    return preventRender ? null : (
      <PropProvider<CheckboxInputProps>
        data={{ ...props, error: newError, errorMsg: newError(value), value, indeterminate }}
      >
        <WrappedCheckboxInput />
      </PropProvider>
    );
  }
);
