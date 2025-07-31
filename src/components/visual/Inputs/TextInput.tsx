import type { AutocompleteProps } from '@mui/material';
import { Autocomplete, Typography } from '@mui/material';
import {
  HelperText,
  PasswordInput,
  ResetInput,
  StyledEndAdornment,
  StyledFormControl,
  StyledFormLabel,
  StyledInputSkeleton,
  StyledTextField
} from 'components/visual/Inputs/lib/inputs.components';
import { useInputState } from 'components/visual/Inputs/lib/inputs.hook';
import type { InputProps } from 'components/visual/Inputs/lib/inputs.model';
import { isValidValue } from 'components/visual/Inputs/lib/inputs.utils';
import type { ElementType } from 'react';
import React, { useCallback, useMemo, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';

export type TextInputProps = Omit<
  AutocompleteProps<string, boolean, boolean, boolean, ElementType>,
  'renderInput' | 'options' | 'onChange' | 'value' | 'defaultValue'
> &
  InputProps<string> & {
    options?: AutocompleteProps<string, boolean, boolean, boolean, ElementType>['options'];
  };

const WrappedTextInput = ({
  options = [],
  error = () => '',
  onBlur = () => null,
  onChange = () => null,
  onError = () => null,
  onFocus = () => null,
  onReset = null,
  ...props
}: TextInputProps) => {
  const { t } = useTranslation('inputs');

  const { setFocused, setShowPassword, ...state } = useInputState<string, TextInputProps>(props);

  const [inputValue, setInputValue] = useState<string>(null);

  const [, startTransition] = useTransition();

  const validator = useCallback(
    (value: string): string => {
      if (error(value)) return error(value);
      else if (state.required && !isValidValue(value)) return t('error.required');
      else return null;
    },
    [error, state.required, t]
  );

  const errorMsg = useMemo<string>(() => validator(inputValue ?? state.value), [inputValue, validator, state.value]);

  return state.preventRender ? null : (
    <div {...state.rootProps} style={{ textAlign: 'left', ...state.rootProps?.style }}>
      <StyledFormLabel
        disabled={state.disabled}
        errorMsg={errorMsg}
        focused={state.focused}
        id={state.id}
        label={state.label}
        labelProps={state.labelProps}
        preventDisabledColor={state.preventDisabledColor}
        tooltip={state.tooltip}
        tooltipProps={state.tooltipProps}
      />
      <StyledFormControl disabled={state.disabled} divider={state.divider} readOnly={state.readOnly}>
        {state.loading ? (
          <StyledInputSkeleton tiny={state.tiny} />
        ) : (
          <Autocomplete
            id={state.id}
            autoComplete={state.autoComplete}
            disableClearable
            disabled={state.disabled}
            freeSolo
            fullWidth
            inputValue={inputValue ?? (state.value || '')}
            options={options}
            readOnly={state.readOnly}
            size="small"
            value={state.value || ''}
            onInputChange={(event, value) => {
              event.preventDefault();
              event.stopPropagation();
              setInputValue(value);

              startTransition(() => {
                const err = validator(value);
                if (err) onError(err);
                else onChange(event, value);
              });
            }}
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
            renderOption={(props, option) => (
              <Typography {...props} key={option} {...(state.tiny && { variant: 'body2' })}>
                {option}
              </Typography>
            )}
            renderInput={params => (
              <StyledTextField
                params={params}
                disabled={state.disabled}
                errorMsg={errorMsg}
                id={state.id}
                monospace={state.monospace}
                password={state.password}
                placeholder={state.placeholder}
                readOnly={state.readOnly}
                showPassword={state.showPassword}
                startAdornment={state.startAdornment}
                tiny={state.tiny}
                slotProps={{
                  input: {
                    endAdornment: (
                      <StyledEndAdornment
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
                        {state.endAdornment}
                      </StyledEndAdornment>
                    )
                  }
                }}
              />
            )}
          />
        )}
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
      </StyledFormControl>
    </div>
  );
};

export const TextInput: (props: TextInputProps) => React.ReactNode = React.memo(WrappedTextInput);
