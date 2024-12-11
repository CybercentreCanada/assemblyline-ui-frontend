import RefreshIcon from '@mui/icons-material/Refresh';
import type { AutocompleteProps, IconButtonProps, ListItemTextProps } from '@mui/material';
import { Autocomplete, IconButton, ListItem, Skeleton, TextField, Typography, useTheme } from '@mui/material';
import type { ElementType } from 'react';
import React, { useMemo } from 'react';
import { InputListItem, InputListItemText, InputResetButton, InputSkeleton } from './Inputs';

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
  primaryProps?: ListItemTextProps<'span', 'p'>['primaryTypographyProps'];
  secondary?: ListItemTextProps['secondary'];
  secondaryProps?: ListItemTextProps<'span', 'p'>['secondaryTypographyProps'];
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
  id,
  capitalize = false,
  defaultValue = null,
  disabled = false,
  loading = false,
  options = [],
  primary,
  primaryProps = null,
  secondary,
  secondaryProps = null,
  value,
  hidden: hiddenProp = false,
  onChange,
  onReset = () => null,
  ...other
}: Props<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>) => {
  const theme = useTheme();

  const showReset = useMemo<boolean>(() => defaultValue !== null && value !== defaultValue, [defaultValue, value]);

  const hidden = useMemo<boolean>(() => hiddenProp && disabled, [disabled, hiddenProp]);

  return hidden ? null : (
    <InputListItem disabled={disabled} sx={{ columnGap: theme.spacing(0.5) }}>
      <InputListItemText
        primary={<label htmlFor={id}>{primary}</label>}
        secondary={secondary}
        primaryTypographyProps={{ sx: { textTransform: capitalize ? 'capitalize' : null }, ...primaryProps }}
        secondaryTypographyProps={secondaryProps}
      />
      {loading ? (
        <InputSkeleton />
      ) : (
        <>
          <InputResetButton visible={showReset} onClick={onReset} />
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
    </InputListItem>
  );

  return (
    <ListItem disabled={disabled} sx={{ columnGap: theme.spacing(0.5) }}>
      <div style={{ flex: 1 }}>
        {primary && (
          <Typography
            component="label"
            htmlFor={id}
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
          renderInput={({ inputProps, ...params }) => <TextField {...params} inputProps={{ ...inputProps, id }} />}
          {...other}
        />
      )}
    </ListItem>
  );
};

export const TextInput = React.memo(WrappedTextInput);
