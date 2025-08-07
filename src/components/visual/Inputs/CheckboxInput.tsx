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
import { useInputHandlers, useInputParsedProps } from 'components/visual/Inputs/lib/inputs.hook';
import type { InputProps, InputValues } from 'components/visual/Inputs/lib/inputs.model';
import { PropProvider, usePropStore } from 'components/visual/Inputs/lib/inputs.provider';
import { Tooltip } from 'components/visual/Tooltip';
import React from 'react';

export type CheckboxInputProps = InputValues<boolean, boolean, React.MouseEvent<HTMLButtonElement, MouseEvent>> &
  InputProps & {
    indeterminate?: CheckboxProps['indeterminate'];
  };

const WrappedCheckboxInput = React.memo(() => {
  const [get] = usePropStore<CheckboxInputProps>();

  const indeterminate = get('indeterminate');
  const inputValue = get('inputValue');
  const loading = get('loading');
  const preventDisabledColor = get('preventDisabledColor');
  const readOnly = get('readOnly');
  const tooltip = get('tooltip');
  const tooltipProps = get('tooltipProps');
  const value = get('value');

  const { handleClick, handleFocus, handleBlur } = useInputHandlers<CheckboxInputProps>();

  return (
    <Tooltip title={loading ? null : tooltip} {...tooltipProps}>
      <StyledFormControl>
        <StyledFormButton
          onBlur={e => handleBlur(e, value)}
          onFocus={handleFocus}
          onClick={e => handleClick(e, !inputValue, !inputValue)}
        >
          <StyledFormControlLabel label={<StyledButtonLabel />}>
            <Checkbox
              checked={inputValue}
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
});

export const CheckboxInput = ({ indeterminate = false, preventRender = false, ...props }: CheckboxInputProps) => {
  const parsedProps = useInputParsedProps<boolean, boolean, CheckboxInputProps>({
    ...props,
    indeterminate,
    preventRender
  });

  return preventRender ? null : (
    <PropProvider<CheckboxInputProps>
      props={{ ...parsedProps, inputValue: Boolean(parsedProps.inputValue ?? parsedProps.value) }}
    >
      <WrappedCheckboxInput />
    </PropProvider>
  );
};
