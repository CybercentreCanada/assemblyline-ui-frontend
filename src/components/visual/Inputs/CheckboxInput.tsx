import type { ButtonProps } from '@mui/material';
import { Checkbox } from '@mui/material';
import { ExpandInput } from 'components/visual/Inputs/components/ExpandInput';
import { HelperText } from 'components/visual/Inputs/components/HelperText';
import {
  StyledEndAdornmentBox,
  StyledFormButton,
  StyledFormControl,
  StyledFormControlLabel
} from 'components/visual/Inputs/components/InputComponents';
import { PasswordInput } from 'components/visual/Inputs/components/PasswordInput';
import { ResetInput } from 'components/visual/Inputs/components/ResetInput';
import type { InputProps } from 'components/visual/Inputs/models/Input';
import { Tooltip } from 'components/visual/Tooltip';
import React, { useState } from 'react';

export type CheckboxInputProps = Omit<
  ButtonProps,
  'onChange' | 'onClick' | 'value' | 'error' | 'onBlur' | 'onFocus' | 'defaultValue'
> &
  InputProps<boolean>;

const WrappedCheckboxInput = (props: CheckboxInputProps) => {
  const {
    disabled = false,
    error = () => '',
    indeterminate = false,
    loading = false,
    preventDisabledColor = false,
    preventRender = false,
    readOnly = false,
    tooltip = null,
    tooltipProps = null,
    value = false,
    onBlur = () => null,
    onChange = () => null,
    onError = () => null,
    onFocus = () => null
  } = props;

  const [focused, setFocused] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(true);

  return preventRender ? null : (
    <Tooltip title={loading ? null : tooltip} {...tooltipProps}>
      <StyledFormControl props={props}>
        <StyledFormButton
          props={props}
          onChange={event => {
            onChange(event, !value);
            const err = error(!value);
            if (err) onError(err);
          }}
          onFocus={(event, ...other) => {
            setFocused(!readOnly && !disabled && document.activeElement === event.target);
            onFocus(event, ...other);
          }}
          onBlur={(event, ...other) => {
            setFocused(false);
            onBlur(event, ...other);
          }}
        >
          <StyledFormControlLabel props={props} focused={focused} showPassword={showPassword}>
            <Checkbox
              checked={value}
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

        <HelperText props={props} />

        <StyledEndAdornmentBox props={props}>
          <PasswordInput props={props} showPassword={showPassword} onShowPassword={() => setShowPassword(p => !p)} />
          <ResetInput props={props} />
          <ExpandInput props={props} />
        </StyledEndAdornmentBox>
      </StyledFormControl>
    </Tooltip>
  );
};

export const CheckboxInput = React.memo(WrappedCheckboxInput);
