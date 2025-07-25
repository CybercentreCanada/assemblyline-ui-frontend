import type { AutocompleteProps, AutocompleteValue } from '@mui/material';
import { Autocomplete, Typography } from '@mui/material';
import { HelperText } from 'components/visual/Inputs/components/HelperText';
import {
  isValidValue,
  StyledFormControl,
  StyledFormLabel,
  StyledInputSkeleton,
  StyledTextField,
  useInputState
} from 'components/visual/Inputs/components/InputComponents';
import type { InputProps } from 'components/visual/Inputs/models/Input';
import type { ElementType } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export type TextInputProps = Omit<
  AutocompleteProps<string, boolean, boolean, boolean, ElementType>,
  'renderInput' | 'options' | 'onChange' | 'value' | 'defaultValue'
> &
  InputProps<string> & {
    options?: AutocompleteProps<string, boolean, boolean, boolean, ElementType>['options'];
  };

const WrappedTextInput = (props: TextInputProps) => {
  const { t } = useTranslation('inputs');

  return null;

  const {
    autoComplete,
    disabled,
    error = () => '',
    loading = false,
    options = [],
    preventRender = false,
    readOnly = false,
    required = false,
    rootProps = null,
    tiny = false,
    value = ''
  } = props;

  const state = useInputState<string, AutocompleteValue<string, boolean, boolean, boolean>>(props, v => {
    if (error(v)) return error(v);
    else if (required && !isValidValue(v)) return t('error.required');
    else return null;
  });

  return preventRender ? null : (
    <div {...rootProps} style={{ textAlign: 'left', ...rootProps?.style }}>
      <StyledFormLabel props={props} state={state} />
      <StyledFormControl props={props} state={state}>
        {loading ? (
          <StyledInputSkeleton props={props} state={state} />
        ) : (
          <Autocomplete
            id={state.id}
            autoComplete={autoComplete}
            disableClearable
            disabled={disabled}
            freeSolo
            fullWidth
            inputValue={value || ''}
            options={options}
            readOnly={readOnly}
            size="small"
            value={state.inputValue}
            onChange={(e, v) => state.setInputValue(v)}
            onInputChange={(e, v) => state.handleChange(e, v)}
            onFocus={e => state.handleFocus(e)}
            onBlur={e => state.handleBlur(e)}
            renderOption={(props, option) => (
              <Typography {...props} key={option} {...(tiny && { variant: 'body2' })} children={option} />
            )}
            renderInput={params => <StyledTextField {...params} props={props} state={state} />}
          />
        )}
        <HelperText props={props} state={state} />
      </StyledFormControl>
    </div>
  );
};

export const TextInput: (props: TextInputProps) => React.ReactNode = React.memo(WrappedTextInput);
