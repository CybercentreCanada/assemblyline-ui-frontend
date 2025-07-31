import type { ButtonProps } from '@mui/material';
import { Switch } from '@mui/material';
import {
  ExpandInput,
  HelperText,
  PasswordInput,
  ResetInput,
  StyledEndAdornmentBox,
  StyledFormButton,
  StyledFormControl,
  StyledFormControlLabel
} from 'components/visual/Inputs/lib/inputs.components';
import { useInputState } from 'components/visual/Inputs/lib/inputs.hook';
import type { InputProps } from 'components/visual/Inputs/lib/inputs.model';
import { isValidValue } from 'components/visual/Inputs/lib/inputs.utils';
import { Tooltip } from 'components/visual/Tooltip';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export type SwitchInputProps = Omit<
  ButtonProps,
  'onChange' | 'onClick' | 'value' | 'error' | 'onBlur' | 'onFocus' | 'defaultValue'
> &
  InputProps<boolean>;

export const SwitchInput: React.FC<SwitchInputProps> = React.memo((props: SwitchInputProps) => {
  const { t } = useTranslation('inputs');

  return null;

  const {
    error = () => '',
    loading = false,
    preventDisabledColor = false,
    preventRender = false,
    readOnly = false,
    required = false,
    tooltip = null,
    tooltipProps = null,
    value = false
  } = useMemo<SwitchInputProps>(() => props, [props]);

  const state = useInputState<boolean, boolean>(props, v => {
    if (error(v)) return error(v);
    else if (required && !isValidValue(v)) return t('error.required');
    else return null;
  });

  return preventRender ? null : (
    <Tooltip title={loading ? null : tooltip} {...tooltipProps}>
      <StyledFormControl props={props} state={state}>
        <StyledFormButton props={props} state={state}>
          <StyledFormControlLabel props={props} state={state}>
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

        <HelperText props={props} state={state} />

        <StyledEndAdornmentBox props={props} state={state}>
          <PasswordInput props={props} state={state} />
          <ResetInput props={props} state={state} />
          <ExpandInput props={props} state={state} />
        </StyledEndAdornmentBox>
      </StyledFormControl>
    </Tooltip>
  );
});
