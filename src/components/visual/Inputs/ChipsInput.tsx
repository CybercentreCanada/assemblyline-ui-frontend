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
import React from 'react';

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
  const value = get('value');

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
            onBlur={e => handleBlur(e, value)}
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
  endAdornment = null,
  isOptionEqualToValue = (option, value) => option === value,
  options = [],
  preventRender = false,
  value = [],
  ...props
}: ChipsInputProps) => {
  const parsedProps = useInputParsedProps({
    ...props,
    autoComplete,
    endAdornment,
    isOptionEqualToValue,
    options,
    preventRender,
    value
  });

  return preventRender ? null : (
    <PropProvider<ChipsInputProps>
      props={{
        ...parsedProps,
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
