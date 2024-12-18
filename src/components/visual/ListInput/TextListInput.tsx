import type { AutocompleteProps, IconButtonProps, ListItemTextProps } from '@mui/material';
import { Autocomplete, ListItem, TextField } from '@mui/material';
import type { ElementType } from 'react';
import React, { useMemo } from 'react';
import { BaseListItemText } from './components/BaseListInput';
import type { ResetListInputProps } from './components/ResetListInput';
import { ResetListInput } from './components/ResetListInput';
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
  primary?: ListItemTextProps['primary'];
  primaryProps?: ListItemTextProps<'span', 'p'>['primaryTypographyProps'];
  secondary?: ListItemTextProps['secondary'];
  secondaryProps?: ListItemTextProps<'span', 'p'>['secondaryTypographyProps'];

  value: AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>['inputValue'];
  capitalize?: boolean;
  render?: boolean;
  loading?: boolean;
  showReset?: boolean;
  resetProps?: ResetListInputProps;
  options?: AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>['options'];

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
  id,
  primary,
  primaryProps = null,
  secondary,
  secondaryProps = null,

  value,
  capitalize = false,
  disabled = false,
  render: renderProp = true,
  loading = false,
  showReset,
  resetProps = null,
  options = [],

  onChange,
  onReset = () => null,
  ...other
}: Props<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>) => {
  const render = useMemo<boolean>(() => renderProp && disabled, [disabled, renderProp]);

  return !render ? null : (
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
          {showReset === null ? null : <ResetListInput visible={showReset} onClick={onReset} {...resetProps} />}
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
            {...other}
          />
        </>
      )}
    </ListItem>
  );
};

export const TextListInput = React.memo(WrappedTextListInput);
