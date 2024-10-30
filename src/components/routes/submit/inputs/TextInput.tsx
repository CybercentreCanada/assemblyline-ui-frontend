import ClearIcon from '@mui/icons-material/Clear';
import type { AutocompleteProps, TypographyProps } from '@mui/material';
import { Autocomplete, IconButton, Skeleton, TextField, Typography, useTheme } from '@mui/material';
import type { ElementType } from 'react';
import React, { useState } from 'react';

type Props<
  Value,
  Multiple extends boolean,
  DisableClearable extends boolean,
  FreeSolo extends boolean,
  ChipComponent extends ElementType
> = Omit<
  AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>,
  'renderInput' | 'options' | 'onChange' | 'value'
> & {
  label?: string;
  labelProps?: TypographyProps;
  loading?: boolean;
  options?: AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>['options'];
  value: string;
  onChange?: (value: string) => void;
  onReset?: () => void;
};

const WrappedTextInput = <
  Value,
  Multiple extends boolean,
  DisableClearable extends boolean,
  FreeSolo extends boolean,
  ChipComponent extends ElementType
>({
  label,
  labelProps,
  loading = false,
  options = [],
  value,
  disabled,
  onChange,
  onReset,
  ...other
}: Props<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>) => {
  const theme = useTheme();

  const [_value, setValue] = useState(null);

  return (
    <div style={{ margin: `${theme.spacing(1)} 0px` }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {label && (
          <Typography
            color="textSecondary"
            variant="caption"
            whiteSpace="nowrap"
            textTransform="capitalize"
            gutterBottom
            sx={{ flex: 1 }}
            {...labelProps}
            children={label.replaceAll('_', ' ')}
          />
        )}
        {onReset && !!value && !disabled && (
          <IconButton
            size="small"
            onClick={() => {
              setValue(null);
              onReset();
            }}
          >
            <ClearIcon style={{ width: theme.spacing(2.5), height: theme.spacing(2.5) }} />
          </IconButton>
        )}
      </div>

      {loading ? (
        <Skeleton style={{ height: '3rem' }} />
      ) : (
        <Autocomplete
          autoComplete
          freeSolo
          disableClearable
          fullWidth
          size="small"
          value={_value}
          inputValue={value || ''}
          options={options}
          onChange={(e, v: unknown) => setValue(v)}
          onInputChange={(_, v) => {
            setValue(null);
            onChange(v);
          }}
          renderInput={params => <TextField {...params} />}
          {...other}
        />
      )}
    </div>
  );
};

export const TextInput = React.memo(WrappedTextInput);
