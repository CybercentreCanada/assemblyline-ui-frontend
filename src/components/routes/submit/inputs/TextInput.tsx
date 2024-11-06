import ClearIcon from '@mui/icons-material/Clear';
import type { AutocompleteProps, TooltipProps, TypographyProps } from '@mui/material';
import { Autocomplete, IconButton, Skeleton, TextField, Tooltip, Typography, useTheme } from '@mui/material';
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
  errors?: (string | false)[];
  tooltipProps?: Omit<TooltipProps, 'children'>;
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
  errors = [],
  tooltipProps,
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
            component="label"
            htmlFor={label.replaceAll('_', ' ')}
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
        <Tooltip
          disableFocusListener={!tooltipProps}
          disableHoverListener={!tooltipProps}
          disableInteractive={!tooltipProps}
          disableTouchListener={!tooltipProps}
          {...tooltipProps}
        >
          <div>
            <Autocomplete
              id={label.replaceAll('_', ' ')}
              autoComplete
              freeSolo
              disableClearable
              fullWidth
              size="small"
              value={_value}
              inputValue={value || ''}
              options={options}
              onChange={(e, v) => setValue(v)}
              onInputChange={(_, v) => {
                setValue(v);
                onChange(v);
              }}
              renderInput={params => (
                <TextField
                  error={errors.filter(err => !!err).length > 0}
                  helperText={errors.filter(err => !!err).join(', ')}
                  {...params}
                />
              )}
              {...other}
            />
          </div>
        </Tooltip>
      )}
    </div>
  );
};

export const TextInput = React.memo(WrappedTextInput);
