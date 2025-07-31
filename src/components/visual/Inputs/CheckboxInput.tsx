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
import { useInputState } from 'components/visual/Inputs/lib/inputs.hook';
import { type InputProps } from 'components/visual/Inputs/lib/inputs.model';
import { isValidValue } from 'components/visual/Inputs/lib/inputs.utils';
import { Tooltip } from 'components/visual/Tooltip';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export type CheckboxInputProps = InputProps<boolean> & {
  indeterminate?: CheckboxProps['indeterminate'];
};

const WrappedCheckboxInput = ({
  indeterminate = false,
  error = () => '',
  onBlur = () => null,
  onChange = () => null,
  onError = () => null,
  onExpand = () => null,
  onFocus = () => null,
  onReset = null,
  ...props
}: CheckboxInputProps) => {
  const { t } = useTranslation('inputs');

  const { setFocused, setShowPassword, ...state } = useInputState<boolean, CheckboxInputProps>(props);

  const [inputValue, setInputValue] = useState<boolean>(null);

  const validator = useCallback(
    (value: boolean): string => {
      if (error(value)) return error(value);
      else if (state.required && !isValidValue(value)) return t('error.required');
      else return null;
    },
    [error, state.required, t]
  );

  const errorMsg = useMemo<string>(() => validator(inputValue ?? state.value), [inputValue, validator, state.value]);

  return state.preventRender ? null : (
    <Tooltip title={state.loading ? null : state.tooltip} {...state.tooltipProps}>
      <StyledFormControl disabled={state.disabled} divider={state.divider} readOnly={state.readOnly}>
        <StyledFormButton
          disabled={state.disabled}
          loading={state.loading}
          preventDisabledColor={state.preventDisabledColor}
          readOnly={state.readOnly}
          tiny={state.tiny}
          onFocus={event => {
            setFocused(!state.readOnly && !state.disabled && document.activeElement === event.target);
            onFocus(event);
            setInputValue(state.value);
          }}
          onBlur={event => {
            setFocused(false);
            onBlur(event);
            setInputValue(null);
          }}
          onClick={event => {
            event.preventDefault();
            event.stopPropagation();

            setInputValue(v => {
              const err = validator(!v);
              if (err) onError(err);
              else onChange(event, !v);
              return !v;
            });
          }}
        >
          <StyledFormControlLabel
            disabled={state.disabled}
            loading={state.loading}
            preventExpandRender={state.preventExpandRender}
            preventPasswordRender={state.preventPasswordRender}
            preventResetRender={state.preventResetRender}
            readOnly={state.readOnly}
            showOverflow={state.showOverflow}
            tiny={state.tiny}
            label={
              <StyledButtonLabel
                disabled={state.disabled}
                endAdornment={state.endAdornment}
                errorMsg={errorMsg}
                focused={state.focused}
                label={state.label}
                labelProps={state.labelProps}
                loading={state.loading}
                monospace={state.monospace}
                password={state.password}
                preventDisabledColor={state.preventDisabledColor}
                showOverflow={state.showOverflow}
                showPassword={state.showPassword}
              />
            }
          >
            <Checkbox
              checked={inputValue ?? state.value}
              indeterminate={indeterminate}
              disableFocusRipple
              disableRipple
              disableTouchRipple
              size="small"
              sx={{
                paddingTop: '0px',
                paddingBottom: '0px',
                minWidth: '40px',
                ...((state.preventDisabledColor || state.readOnly) && { color: 'inherit !important' })
              }}
            />
          </StyledFormControlLabel>
        </StyledFormButton>

        <HelperText
          disabled={state.disabled}
          errorMsg={errorMsg}
          errorProps={state.errorProps}
          helperText={state.helperText}
          helperTextProps={state.helperTextProps}
          id={state.id}
          loading={state.loading}
          readOnly={state.readOnly}
        />

        <StyledEndAdornmentBox
          preventExpandRender={state.preventExpandRender}
          preventPasswordRender={state.preventPasswordRender}
          preventResetRender={state.preventResetRender}
        >
          <PasswordInput
            id={state.id}
            preventPasswordRender={state.preventPasswordRender}
            resetProps={state.resetProps}
            showPassword={state.showPassword}
            tiny={state.tiny}
            onClick={() => setShowPassword(p => !p)}
          />
          <ResetInput
            defaultValue={state.defaultValue}
            id={state.id}
            preventResetRender={state.preventResetRender}
            resetProps={state.resetProps}
            tiny={state.tiny}
            onReset={onReset}
            onChange={event => {
              event.preventDefault();
              event.stopPropagation();
              onChange(event, state.defaultValue);
            }}
          />
          <ExpandInput
            expand={state.expand}
            expandProps={state.expandProps}
            id={state.id}
            preventExpandRender={state.preventExpandRender}
            onExpand={onExpand}
          />
        </StyledEndAdornmentBox>
      </StyledFormControl>
    </Tooltip>
  );
};

export const CheckboxInput: React.FC<CheckboxInputProps> = React.memo(WrappedCheckboxInput);
