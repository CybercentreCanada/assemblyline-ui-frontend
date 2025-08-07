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

export type ChipsInputProps = InputValues<string[], string[], React.SyntheticEvent<Element, Event>> &
  InputProps & {
    autoComplete?: AutocompleteProps<string, true, false, true, ElementType>['autoComplete'];
    disableCloseOnSelect?: AutocompleteProps<string, true, false, true, ElementType>['disableCloseOnSelect'];
    filterSelectedOptions?: AutocompleteProps<string, true, false, true, ElementType>['filterSelectedOptions'];
    isOptionEqualToValue?: (option: string, value: string) => boolean;
    options?: string[];
    renderOption?: AutocompleteProps<string, true, false, true, ElementType>['renderOption'];
    renderValue?: AutocompleteProps<string, true, false, true, ElementType>['renderValue'];
  };

const WrappedChipsInput = React.memo(() => {
  const [get] = usePropStore<ChipsInputProps>();

  const autoComplete = get('autoComplete');
  const disableCloseOnSelect = get('disableCloseOnSelect');
  const disabled = get('disabled');
  const filterSelectedOptions = get('filterSelectedOptions');
  const id = get('id');
  const inputValue = get('inputValue');
  const isOptionEqualToValue = get('isOptionEqualToValue');
  const loading = get('loading');
  const options = get('options');
  const readOnly = get('readOnly');
  const renderOption = get('renderOption');
  const renderValue = get('renderValue');
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
            disableCloseOnSelect={disableCloseOnSelect}
            disabled={disabled}
            filterSelectedOptions={filterSelectedOptions}
            freeSolo
            id={id}
            isOptionEqualToValue={isOptionEqualToValue}
            multiple
            options={options}
            readOnly={readOnly}
            size="small"
            value={inputValue ?? []}
            onChange={(e, v) => handleChange(e, v as string[], v as string[])}
            onFocus={handleFocus}
            onBlur={e => handleBlur(e, value)}
            renderValue={
              renderValue ??
              ((values, getTagProps) =>
                values.map((option, index) => {
                  const { key, ...tagProps } = getTagProps({ index });
                  return <StyledCustomChip key={key} label={option} {...tagProps} />;
                }))
            }
            renderInput={params => <StyledTextField params={params} />}
            renderOption={renderOption}
          />
        )}
        <HelperText />
      </StyledFormControl>
    </StyledRoot>
  );
});

export const ChipsInput = ({
  autoComplete = false,
  disableCloseOnSelect = false,
  endAdornment = null,
  filterSelectedOptions = false,
  isOptionEqualToValue = (option, value) => option === value,
  options = [],
  preventRender = false,
  renderOption = null,
  renderValue = null,
  value = [],
  ...props
}: ChipsInputProps) => {
  const parsedProps = useInputParsedProps<string[], string[], ChipsInputProps>({
    ...props,
    autoComplete,
    disableCloseOnSelect,
    endAdornment,
    filterSelectedOptions,
    isOptionEqualToValue,
    options,
    preventRender,
    renderOption,
    renderValue,
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
