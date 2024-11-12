import type { AutocompleteProps, ListItemTextProps, TypographyProps } from '@mui/material';
import { Autocomplete, ListItem, Skeleton, TextField, Typography, useTheme } from '@mui/material';
import type { ElementType } from 'react';
import React from 'react';

type Props<
  Value,
  Multiple extends boolean,
  DisableClearable extends boolean,
  FreeSolo extends boolean,
  ChipComponent extends ElementType
> = Omit<
  AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>,
  'renderInput' | 'options' | 'onChange'
> & {
  primary?: ListItemTextProps['primary'];
  secondary?: ListItemTextProps['secondary'];
  primaryProps?: TypographyProps;
  loading?: boolean;
  capitalize?: boolean;
  options?: AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>['options'];
  onChange?: (value: string) => void;
};

const WrappedTextInput = <
  Value,
  Multiple extends boolean,
  DisableClearable extends boolean,
  FreeSolo extends boolean,
  ChipComponent extends ElementType
>({
  primary,
  secondary,
  primaryProps = null,
  loading = false,
  capitalize = false,
  options = [],
  disabled = false,
  value,
  onChange,
  ...other
}: Props<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>) => {
  const theme = useTheme();

  return (
    <ListItem disabled={disabled} sx={{ justifyContent: 'space-between', columnGap: theme.spacing(2) }}>
      <div>
        {primary && (
          <Typography
            color="textPrimary"
            variant="body1"
            whiteSpace="nowrap"
            textTransform={capitalize ? 'capitalize' : null}
            children={primary}
            {...primaryProps}
          />
        )}
        {secondary && <Typography color="textSecondary" variant="body2" children={secondary} />}
      </div>

      {loading ? (
        <Skeleton height={40} style={{ width: '100%', maxWidth: '30%' }} />
      ) : (
        <Autocomplete
          autoComplete
          freeSolo
          disableClearable
          fullWidth
          size="small"
          sx={{ maxWidth: '30%' }}
          value={value || null}
          disabled={disabled}
          options={options}
          onInputChange={(_, v) => onChange(v)}
          renderInput={params => <TextField {...params} />}
          {...other}
        />
      )}
    </ListItem>
  );
};

export const TextInput = React.memo(WrappedTextInput);
