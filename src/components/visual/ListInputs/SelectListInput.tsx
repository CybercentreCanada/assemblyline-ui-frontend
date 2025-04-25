import type {
  FormHelperTextProps,
  IconButtonProps,
  ListItemTextProps,
  MenuItemProps,
  SelectChangeEvent,
  SelectProps,
  TypographyProps
} from '@mui/material';
import { MenuItem, Select, useTheme } from '@mui/material';
import { ListItemText } from 'components/visual/List/ListItemText';
import { BaseListItem } from 'components/visual/ListInputs/components/BaseListInput';
import type { ResetListInputProps } from 'components/visual/ListInputs/components/ResetListInput';
import { ResetListInput } from 'components/visual/ListInputs/components/ResetListInput';
import { SkeletonListInput } from 'components/visual/ListInputs/components/SkeletonListInput';
import type { CSSProperties } from 'react';
import React, { useMemo } from 'react';

export type SelectListInputProps = Omit<SelectProps, 'defaultValue' | 'error' | 'onChange'> & {
  capitalize?: boolean;
  disablePadding?: boolean;
  error?: (value: SelectProps['value']) => string;
  errorProps?: FormHelperTextProps;
  hasEmpty?: boolean;
  inset?: boolean;
  loading?: boolean;
  options: {
    primary: ListItemTextProps['primary'];
    secondary?: ListItemTextProps['secondary'];
    value: MenuItemProps['value'];
  }[];
  preventRender?: boolean;
  primary?: React.ReactNode;
  primaryProps?: ListItemTextProps<'span', 'p'>['primaryTypographyProps'];
  primaryVariant?: TypographyProps['variant'];
  readOnly?: boolean;
  reset?: boolean;
  resetProps?: ResetListInputProps;
  secondary?: React.ReactNode;
  secondaryProps?: ListItemTextProps<'span', 'p'>['secondaryTypographyProps'];
  tiny?: boolean;
  width?: CSSProperties['width'];
  onChange?: (event: SelectChangeEvent<unknown>, value: string) => void;
  onReset?: IconButtonProps['onClick'];
  onError?: (error: string) => void;
};

const WrappedSelectListInput = ({
  capitalize = false,
  disabled = false,
  disablePadding = false,
  error = () => null,
  errorProps = null,
  hasEmpty = false,
  id = null,
  inset = false,
  loading = false,
  options = [],
  preventRender = false,
  primary,
  primaryProps = null,
  primaryVariant = 'body1',
  readOnly = false,
  reset = false,
  resetProps = null,
  secondary,
  secondaryProps = null,
  tiny = false,
  value,
  width = '30%',
  onChange = () => null,
  onReset = () => null,
  onError = () => null,
  ...selectProps
}: SelectListInputProps) => {
  const theme = useTheme();

  const errorValue = useMemo<string>(() => error(value), [error, value]);

  return preventRender ? null : (
    <BaseListItem
      disabled={disabled && !loading}
      error={errorValue && !disabled && !loading && !readOnly}
      helperText={errorValue}
      FormHelperTextProps={errorProps}
      sx={{ ...(disablePadding && { padding: ` 0px ${theme.spacing(1)}` }) }}
    >
      <ListItemText
        id={id}
        primary={primary}
        secondary={secondary}
        primaryTypographyProps={{ variant: primaryVariant, ...primaryProps }}
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
            tiny={tiny}
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
            value={value}
            inputProps={{
              id: id || primary.toString(),
              style: { color: 'textPrimary' }
            }}
            slotProps={{
              input: {
                sx: {
                  display: 'flex',
                  alignItems: 'center',
                  ...(tiny && {
                    paddingTop: theme.spacing(0.5),
                    paddingBottom: theme.spacing(0.5)
                  })
                }
              }
            }}
            renderValue={option => (
              <ListItemText
                primary={options.find(o => o.value === option)?.primary || ''}
                primaryTypographyProps={{
                  ...(!(disabled || readOnly) && { sx: { cursor: 'pointer' } }),
                  ...(tiny && { variant: 'body2' })
                }}
                style={{ margin: 0 }}
              />
            )}
            onChange={event => {
              onChange(event, event.target.value as string);

              const err = error(event.target.value as string);
              if (err) onError(err);
            }}
            {...selectProps}
            sx={{
              maxWidth: width,
              minWidth: width,
              ...(capitalize && { textTransform: 'capitalize' }),
              ...(readOnly &&
                !disabled && {
                  '& .MuiInputBase-input': { cursor: 'default', color: theme.palette.text.primary },
                  '& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)'
                  }
                }),
              ...selectProps?.sx
            }}
          >
            {hasEmpty && <MenuItem value="" sx={{ height: '36px' }}></MenuItem>}
            {options.map((option, i) => (
              <MenuItem
                key={i}
                value={option.value}
                sx={{
                  '&>label': { margin: 0, cursor: 'pointer !important', maxWidth: theme.breakpoints.values.sm },
                  ...(capitalize && { textTransform: 'capitalize' })
                }}
              >
                <ListItemText
                  primary={option.primary}
                  secondary={option.secondary}
                  primaryTypographyProps={{
                    overflow: 'auto',
                    textOverflow: 'initial',
                    whiteSpace: 'normal',
                    variant: primaryVariant
                  }}
                  secondaryTypographyProps={{ overflow: 'auto', textOverflow: 'initial', whiteSpace: 'normal' }}
                />
              </MenuItem>
            ))}
          </Select>
        </>
      )}
    </BaseListItem>
  );
};

export const SelectListInput = React.memo(WrappedSelectListInput);
