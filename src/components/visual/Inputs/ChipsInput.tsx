import type { AutocompleteProps } from '@mui/material';
import { Autocomplete } from '@mui/material';
import {
  ClearInput,
  HelperText,
  StyledCustomChip,
  StyledFormControl,
  StyledFormLabel,
  StyledInputSkeleton,
  StyledRoot,
  StyledTextField
} from 'components/visual/Inputs/lib/inputs.components';
import { useInputHandlers, useInputParsedProps } from 'components/visual/Inputs/lib/inputs.hook';
import type { InputProps, InputValues } from 'components/visual/Inputs/lib/inputs.model';
import { PropProvider, usePropStore } from 'components/visual/Inputs/lib/inputs.provider';
import type { ElementType } from 'react';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export type ChipsInputProps = InputValues<string[]> &
  InputProps & {
    autoComplete?: AutocompleteProps<string, boolean, boolean, boolean, ElementType>['autoComplete'];
    isOptionEqualToValue?: (option: string, value: string) => boolean;
    options?: string[];
  };

const WrappedChipsInput = React.memo(() => {
  const [get] = usePropStore<ChipsInputProps>();

  const autoComplete = get('autoComplete');
  const disabled = get('disabled');
  const id = get('id');
  const inputValue = get('inputValue');
  const isOptionEqualToValue = get('isOptionEqualToValue');
  const loading = get('loading');
  const options = get('options');
  const readOnly = get('readOnly');

  const { handleChange, handleFocus, handleBlur } = useInputHandlers<ChipsInputProps>();

  return (
    <StyledRoot>
      <StyledFormLabel />
      <StyledFormControl>
        {loading ? (
          <StyledInputSkeleton />
        ) : (
          <Autocomplete
            autoComplete={autoComplete}
            disabled={disabled}
            freeSolo
            id={id}
            multiple
            options={options}
            readOnly={readOnly}
            size="small"
            value={inputValue}
            isOptionEqualToValue={isOptionEqualToValue}
            onChange={(e, v) => handleChange(e, v, v)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            renderValue={(values, getTagProps) =>
              values.map((option, index) => {
                const { key, ...tagProps } = getTagProps({ index });
                return <StyledCustomChip key={key} label={option} {...tagProps} />;
              })
            }
            renderInput={params => <StyledTextField params={params} />}
          />
        )}
        <HelperText />
      </StyledFormControl>
    </StyledRoot>
  );
});

export const ChipsInput = ({
  autoComplete = false,
  error = () => '',
  isOptionEqualToValue = (option, value) => option === value,
  options = [],
  preventRender = false,
  value = [],
  endAdornment = null,
  ...props
}: ChipsInputProps) => {
  const { t } = useTranslation('inputs');

  const parsedProps = useInputParsedProps({
    ...props,
    autoComplete,
    endAdornment,
    isOptionEqualToValue,
    options,
    preventRender,
    value
  });

  const newError = useCallback(
    (val: string[]): string => {
      const err = error(val);
      if (err) return err;
      else if (parsedProps.required && !val?.length) return t('error.required');
      else return '';
    },
    [error, parsedProps.required, t]
  );

  return preventRender ? null : (
    <PropProvider<ChipsInputProps>
      props={{
        ...parsedProps,
        error: newError,
        errorMsg: newError(value),
        endAdornment: (
          <>
            {endAdornment}
            <ClearInput />
          </>
        )
      }}
    >
      <WrappedChipsInput />
    </PropProvider>
  );
};
