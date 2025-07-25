import type { ButtonProps } from '@mui/material';
import { Checkbox } from '@mui/material';
import { ExpandInput } from 'components/visual/Inputs/components/ExpandInput';
import { HelperText } from 'components/visual/Inputs/components/HelperText';
import {
  isValidValue,
  StyledEndAdornmentBox,
  StyledFormButton,
  StyledFormControl,
  StyledFormControlLabel,
  useInputState
} from 'components/visual/Inputs/components/InputComponents';
import { PasswordInput } from 'components/visual/Inputs/components/PasswordInput';
import { ResetInput } from 'components/visual/Inputs/components/ResetInput';
import type { InputProps } from 'components/visual/Inputs/models/Input';
import { Tooltip } from 'components/visual/Tooltip';
import React from 'react';
import { useTranslation } from 'react-i18next';

export type CheckboxInputProps = Omit<
  ButtonProps,
  'onChange' | 'onClick' | 'value' | 'error' | 'onBlur' | 'onFocus' | 'defaultValue'
> &
  InputProps<boolean>;

const WrappedCheckboxInput = (props: CheckboxInputProps) => {
  const { t } = useTranslation('inputs');

  const {
    error = () => '',
    indeterminate = false,
    loading = false,
    preventDisabledColor = false,
    preventRender = false,
    required = false,
    readOnly = false,
    tooltip = null,
    tooltipProps = null,
    value = false
  } = props;

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

        <HelperText props={props} state={state} />

        <StyledEndAdornmentBox props={props} state={state}>
          <PasswordInput props={props} state={state} />
          <ResetInput props={props} state={state} />
          <ExpandInput props={props} state={state} />
        </StyledEndAdornmentBox>
      </StyledFormControl>
    </Tooltip>
  );
};

export const CheckboxInput = React.memo(WrappedCheckboxInput);
