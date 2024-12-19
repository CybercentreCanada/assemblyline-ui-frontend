import type { AutocompleteProps, IconButtonProps, ListItemTextProps } from '@mui/material';
import { Autocomplete, ListItem, TextField } from '@mui/material';
import { ResetInput } from 'components/visual/Inputs/components/ResetInput';
import type { ElementType } from 'react';
import React from 'react';
import { BaseListItemText } from './components/BaseListInput';
import type { ResetListInputProps } from './components/ResetListInput';
import { SkeletonListInput } from './components/SkeletonListInput';

type Props<
  Value,
  Multiple extends boolean,
  DisableClearable extends boolean,
  FreeSolo extends boolean,
  ChipComponent extends ElementType
> = Omit<
  AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>,
  'value' | 'renderInput' | 'options' | 'onChange'
> & {
  capitalize?: boolean;
  loading?: boolean;
  options?: AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>['options'];
  preventRender?: boolean;
  primary?: string;
  primaryProps?: ListItemTextProps<'span', 'p'>['primaryTypographyProps'];
  reset?: boolean;
  resetProps?: ResetListInputProps;
  secondary?: ListItemTextProps['secondary'];
  secondaryProps?: ListItemTextProps<'span', 'p'>['secondaryTypographyProps'];
  showReset?: boolean;
  value: AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>['inputValue'];
  onChange?: (value: string) => void;
  onReset?: IconButtonProps['onClick'];
};

const WrappedTextListInput = <
  Value,
  Multiple extends boolean,
  DisableClearable extends boolean,
  FreeSolo extends boolean,
  ChipComponent extends ElementType
>({
  capitalize = false,
  disabled = false,
  id,
  loading = false,
  options = [],
  preventRender = false,
  primary,
  primaryProps = null,
  reset,
  resetProps = null,
  secondary,
  secondaryProps = null,
  value,
  onChange,
  onReset = () => null,
  ...autocompleteProps
}: Props<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>) =>
  preventRender ? null : (
    <ListItem disabled={disabled}>
      <BaseListItemText
        id={id}
        primary={primary}
        secondary={secondary}
        primaryTypographyProps={primaryProps}
        secondaryTypographyProps={secondaryProps}
        capitalize={capitalize}
      />
      {loading ? (
        <SkeletonListInput />
      ) : (
        <>
          <ResetInput label={primary} preventRender={!reset || disabled} onReset={onReset} {...resetProps} />
          <Autocomplete
            autoComplete
            freeSolo
            disableClearable
            fullWidth
            size="small"
            sx={{ maxWidth: '30%' }}
            // value={value || null}
            disabled={disabled}
            options={options}
            inputValue={value}
            onInputChange={(_, v) => onChange(v)}
            renderInput={({ inputProps, ...params }) => <TextField {...params} inputProps={{ ...inputProps, id }} />}
            {...autocompleteProps}
          />
        </>
      )}
    </ListItem>
  );

export const TextListInput = React.memo(WrappedTextListInput);
