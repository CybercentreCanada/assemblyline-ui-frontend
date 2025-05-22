import type { FormHelperTextProps, IconButtonProps, ListItemTextProps, TextFieldProps } from '@mui/material';
import { InputAdornment, TextField, useTheme } from '@mui/material';
import { ListItemText } from 'components/visual/List/ListItemText';
import { BaseListItem } from 'components/visual/ListInputs/components/BaseListInput';
import type { ResetListInputProps } from 'components/visual/ListInputs/components/ResetListInput';
import { ResetListInput } from 'components/visual/ListInputs/components/ResetListInput';
import { SkeletonListInput } from 'components/visual/ListInputs/components/SkeletonListInput';
import type { ReactNode } from 'react';
import React, { useMemo } from 'react';

export type NumberListInputProps = Omit<TextFieldProps, 'error' | 'value' | 'onChange'> & {
  capitalize?: boolean;
  endAdornment?: ReactNode;
  error?: (value: number) => string;
  errorProps?: FormHelperTextProps;
  inset?: boolean;
  loading?: boolean;
  max?: number;
  min?: number;
  preventRender?: boolean;
  primary?: React.ReactNode;
  primaryProps?: ListItemTextProps<'span', 'p'>['primaryTypographyProps'];
  readOnly?: boolean;
  reset?: boolean;
  resetProps?: ResetListInputProps;
  secondary?: React.ReactNode;
  secondaryProps?: ListItemTextProps<'span', 'p'>['secondaryTypographyProps'];
  unnullable?: boolean;
  value: number;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, value: number) => void;
  onReset?: IconButtonProps['onClick'];
  onError?: (error: string) => void;
};

const WrappedNumberListInput = ({
  capitalize = false,
  disabled = false,
  endAdornment,
  error = () => null,
  errorProps = null,
  id = null,
  inset = false,
  loading = false,
  max,
  min,
  preventRender = false,
  primary,
  primaryProps = null,
  readOnly = false,
  reset = false,
  resetProps = null,
  secondary,
  secondaryProps = null,
  unnullable = false,
  value,
  onChange = () => null,
  onReset = () => null,
  onError = () => null,
  ...textFieldProps
}: NumberListInputProps) => {
  const theme = useTheme();

  const errorValue = useMemo<string>(() => error(value), [error, value]);

  return preventRender ? null : (
    <BaseListItem
      disabled={disabled && !loading}
      error={errorValue && !disabled && !loading && !readOnly}
      helperText={errorValue}
      FormHelperTextProps={errorProps}
    >
      <ListItemText
        id={id}
        primary={primary}
        secondary={secondary}
        primaryTypographyProps={primaryProps}
        secondaryTypographyProps={secondaryProps}
        capitalize={capitalize}
        style={{
          marginRight: theme.spacing(2),
          margin: `${theme.spacing(0.25)} 0`,
          ...(inset && { marginLeft: '42px' })
        }}
      />
      {loading ? (
        <SkeletonListInput />
      ) : (
        <>
          <ResetListInput
            id={id || primary.toString()}
            preventRender={!reset || disabled || readOnly}
            onReset={onReset}
            {...resetProps}
          />
          <TextField
            id={id || primary.toString()}
            type="number"
            size="small"
            fullWidth
            value={[null, undefined, '', NaN].includes(value) ? '' : `${value}`}
            disabled={disabled}
            error={!!errorValue && !readOnly}
            {...(readOnly && !disabled && { focused: null })}
            slotProps={{
              input: {
                inputProps: {
                  id: id || primary.toString(),
                  min: min,
                  max: max
                },
                readOnly: readOnly,
                endAdornment: endAdornment && <InputAdornment position="end">{endAdornment}</InputAdornment>
              }
            }}
            sx={{
              maxWidth: '30%',
              minWidth: '30%',
              ...(readOnly &&
                !disabled && {
                  '& .MuiInputBase-input': { cursor: 'default' },
                  '& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)'
                  }
                })
            }}
            onChange={event => {
              const value = event.target.value;

              if (!unnullable && [null, undefined, '', NaN].includes(value)) {
                onChange(event, null);

                const err = error(null);
                if (err) onError(null);
              } else {
                let num = Number(event.target.value);
                num = max ? Math.min(num, max) : num;
                num = min ? Math.max(num, min) : num;
                onChange(event, num);

                const err = error(num);
                if (err) onError(err);
              }
            }}
            {...textFieldProps}
          />
        </>
      )}
    </BaseListItem>
  );
};
export const NumberListInput = React.memo(WrappedNumberListInput);
