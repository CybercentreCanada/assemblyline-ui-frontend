import type { TextFieldProps } from '@mui/material';
import {
  InputAdornment,
  TextField,
  useTheme,
  type FormHelperTextProps,
  type IconButtonProps,
  type ListItemTextProps
} from '@mui/material';
import type { ReactNode } from 'react';
import React, { useMemo } from 'react';
import { BaseListItem, BaseListItemText } from './components/BaseListInput';
import type { ResetListInputProps } from './components/ResetListInput';
import { ResetListInput } from './components/ResetListInput';
import { SkeletonListInput } from './components/SkeletonListInput';

type Props = Omit<TextFieldProps, 'error' | 'value' | 'onChange'> & {
  capitalize?: boolean;
  endAdornment?: ReactNode;
  error?: (value: number) => string;
  errorProps?: FormHelperTextProps;
  loading?: boolean;
  max?: number;
  min?: number;
  preventRender?: boolean;
  primary?: string;
  primaryProps?: ListItemTextProps<'span', 'p'>['primaryTypographyProps'];
  readOnly?: boolean;
  reset?: boolean;
  resetProps?: ResetListInputProps;
  secondary?: ListItemTextProps['secondary'];
  secondaryProps?: ListItemTextProps<'span', 'p'>['secondaryTypographyProps'];
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
  value,
  onChange = () => null,
  onReset = () => null,
  onError = () => null,
  ...textFieldProps
}: Props) => {
  const theme = useTheme();

  const errorValue = useMemo<string>(() => error(value), [error, value]);

  return preventRender ? null : (
    <BaseListItem
      disabled={disabled && !loading}
      error={errorValue && !disabled && !loading && !readOnly}
      helperText={errorValue}
      FormHelperTextProps={errorProps}
    >
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
          <ResetListInput
            id={id || primary}
            preventRender={!reset || disabled || readOnly}
            onReset={onReset}
            {...resetProps}
          />
          <TextField
            type="number"
            size="small"
            fullWidth
            value={value?.toString()}
            disabled={disabled}
            error={!!errorValue && !readOnly}
            {...(readOnly && !disabled && { focused: null })}
            inputProps={{ id: id || primary, min: min, max: max }}
            InputProps={{
              readOnly: readOnly,
              endAdornment: endAdornment && <InputAdornment position="end">{endAdornment}</InputAdornment>
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
              let num = Number(event.target.value);
              num = max ? Math.min(num, max) : num;
              num = min ? Math.max(num, min) : num;
              onChange(event, num);

              const err = error(num);
              if (err) onError(err);
            }}
            {...textFieldProps}
          />
        </>
      )}
    </BaseListItem>
  );
};
export const NumberListInput = React.memo(WrappedNumberListInput);
