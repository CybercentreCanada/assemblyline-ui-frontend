import type { CheckboxProps } from '@mui/material';
import { Checkbox } from '@mui/material';
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
  useInputClick,
  useInputClickBlur,
  useInputFocus,
  usePropID
} from 'components/visual/Inputs/lib/inputs.hook';
import type { InputProps, InputValues } from 'components/visual/Inputs/lib/inputs.model';
import { PropProvider, usePropStore } from 'components/visual/Inputs/lib/inputs.provider';
import { Tooltip } from 'components/visual/Tooltip';
import React from 'react';

export type CheckboxInputProps = InputValues<boolean, boolean, React.MouseEvent<HTMLButtonElement, MouseEvent>> &
  InputProps & {
    indeterminate?: CheckboxProps['indeterminate'];
  };

const WrappedCheckboxInput = () => {
  const [get] = usePropStore<CheckboxInputProps>();

  const id = usePropID();
  const indeterminate = get('indeterminate');
  const inputValue = Boolean(get('inputValue'));
  const loading = get('loading');
  const preventDisabledColor = get('preventDisabledColor');
  const readOnly = get('readOnly');
  const tooltip = get('tooltip');
  const tooltipProps = get('tooltipProps');
  const value = get('value');

  const handleBlur = useInputClickBlur<CheckboxInputProps>();
  const handleClick = useInputClick<CheckboxInputProps>();
  const handleFocus = useInputFocus<CheckboxInputProps>();

  return (
    <Tooltip title={loading ? null : tooltip} {...tooltipProps}>
      <StyledFormControl>
        <StyledFormButton
          onBlur={e => handleBlur(e, value, value)}
          onFocus={handleFocus}
          onClick={e => handleClick(e, !inputValue, !inputValue)}
        >
          <StyledFormControlLabel label={<StyledButtonLabel />}>
            <Checkbox
              name={id}
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
          <PasswordAdornment />
          <ResetAdornment />
          <ExpandAdornment />
        </StyledEndAdornmentBox>
      </StyledFormControl>
    </Tooltip>
  );
};

export const CheckboxInput = ({ preventRender = false, value, ...props }: CheckboxInputProps) => {
  const errorMessage = useErrorCallback({ preventRender, value, ...props });

  return preventRender ? null : (
    <PropProvider<CheckboxInputProps>
      props={{ indeterminate: false, inputValue: value, value, errorMessage, ...props }}
    >
      <WrappedCheckboxInput />
    </PropProvider>
  );
};
