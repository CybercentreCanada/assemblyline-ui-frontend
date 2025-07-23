import type { ButtonProps } from '@mui/material';
import { Switch } from '@mui/material';
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
import React, { useMemo, useState } from 'react';

export type SwitchInputProps = Omit<
  ButtonProps,
  'onChange' | 'onClick' | 'value' | 'error' | 'onBlur' | 'onFocus' | 'defaultValue'
> &
  InputProps<boolean>;

export const SwitchInput: React.FC<SwitchInputProps> = React.memo((props: SwitchInputProps) => {
  const {
    disabled = false,
    error = () => '',
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
  } = useMemo<SwitchInputProps>(() => props, [props]);

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
            <Switch
              checked={value}
              disableFocusRipple
              disableRipple
              disableTouchRipple
              size="small"
              sx={{
                minWidth: '40px',
                '&>.Mui-disabled': {
                  ...((preventDisabledColor || readOnly) && { color: 'inherit !important' })
                }
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
});
