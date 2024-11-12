import RefreshIcon from '@mui/icons-material/Refresh';
import type { AutocompleteProps, IconButtonProps, ListItemTextProps, TypographyProps } from '@mui/material';
import { Autocomplete, IconButton, ListItem, Skeleton, TextField, Typography, useTheme } from '@mui/material';
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
  'value' | 'renderInput' | 'options' | 'onChange'
> & {
  capitalize?: boolean;
  loading?: boolean;
  options?: AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>['options'];
  primary?: ListItemTextProps['primary'];
  primaryProps?: TypographyProps;
  secondary?: ListItemTextProps['secondary'];
  value: AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>['inputValue'];
  onChange?: (value: string) => void;
  onReset?: IconButtonProps['onClick'];
};

const WrappedTextInput = <
  Value,
  Multiple extends boolean,
  DisableClearable extends boolean,
  FreeSolo extends boolean,
  ChipComponent extends ElementType
>({
  capitalize = false,
  defaultValue = null,
  disabled = false,
  loading = false,
  options = [],
  primary,
  primaryProps = null,
  secondary,
  value,
  onChange,
  onReset = () => null,
  ...other
}: Props<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>) => {
  const theme = useTheme();

  return (
    <ListItem disabled={disabled} sx={{ columnGap: theme.spacing(0.5) }}>
      <div style={{ flex: 1 }}>
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

      <div style={{ ...((defaultValue === null || value === defaultValue) && { opacity: 0 }) }}>
        <IconButton
          color="primary"
          children={<RefreshIcon fontSize="small" />}
          onClick={event => {
            event.preventDefault();
            event.stopPropagation();
            onReset(event);
          }}
        />
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
          // value={value || null}
          disabled={disabled}
          options={options}
          inputValue={value}
          onInputChange={(_, v) => onChange(v)}
          renderInput={params => <TextField {...params} />}
          {...other}
        />
      )}
    </ListItem>
  );
};

export const TextInput = React.memo(WrappedTextInput);
