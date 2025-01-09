import type {
  FormHelperTextProps,
  IconButtonProps,
  ListItemTextProps,
  MenuItemProps,
  SelectChangeEvent,
  SelectProps
} from '@mui/material';
import { MenuItem, Select, useTheme } from '@mui/material';
import React, { useMemo } from 'react';
import { BaseListItem, BaseListItemText } from './components/BaseListInput';
import type { ResetListInputProps } from './components/ResetListInput';
import { ResetListInput } from './components/ResetListInput';
import { SkeletonListInput } from './components/SkeletonListInput';

type Props = Omit<SelectProps, 'defaultValue' | 'error' | 'onChange'> & {
  capitalize?: boolean;
  error?: (value: SelectProps['value']) => string;
  errorProps?: FormHelperTextProps;
  hasEmpty?: boolean;
  loading?: boolean;
  options: { label: MenuItemProps['children']; value: MenuItemProps['value'] }[];
  preventRender?: boolean;
  primary?: string;
  primaryProps?: ListItemTextProps<'span', 'p'>['primaryTypographyProps'];
  readOnly?: boolean;
  reset?: boolean;
  resetProps?: ResetListInputProps;
  secondary?: ListItemTextProps['secondary'];
  secondaryProps?: ListItemTextProps<'span', 'p'>['secondaryTypographyProps'];
  onChange?: (event: SelectChangeEvent<unknown>, value: string) => void;
  onReset?: IconButtonProps['onClick'];
  onError?: (error: string) => void;
};

const WrappedSelectListInput = ({
  capitalize = false,
  disabled = false,
  error = () => null,
  errorProps = null,
  hasEmpty = false,
  id,
  loading = false,
  options = [],
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
  ...selectProps
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
            id={primary}
            preventRender={!reset || disabled || readOnly}
            onReset={onReset}
            {...resetProps}
          />
          <Select
            variant="outlined"
            size="small"
            fullWidth
            disabled={disabled || readOnly}
            readOnly={readOnly}
            error={!!errorValue && !readOnly}
            sx={{
              maxWidth: '30%',
              minWidth: '30%',
              ...(capitalize && { textTransform: 'capitalize' }),
              ...(readOnly &&
                !disabled && {
                  '& .MuiInputBase-input': { cursor: 'default', color: theme.palette.text.primary },
                  '& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)'
                  }
                })
            }}
            value={value}
            inputProps={{ id, style: { color: 'textPrimary' } }}
            onChange={event => {
              onChange(event, event.target.value as string);

              const err = error(event.target.value as string);
              if (err) onError(err);
            }}
            {...selectProps}
          >
            {hasEmpty && <MenuItem value="" sx={{ height: '36px' }}></MenuItem>}
            {options.map((option, i) => (
              <MenuItem key={i} value={option.value} sx={{ ...(capitalize && { textTransform: 'capitalize' }) }}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </>
      )}
    </BaseListItem>
  );
};

export const SelectListInput = React.memo(WrappedSelectListInput);
