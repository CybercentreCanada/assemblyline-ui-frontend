import type { IconButtonProps, ListItemTextProps, MenuItemProps, SelectProps } from '@mui/material';
import { ListItem, MenuItem, Select } from '@mui/material';
import { ResetInput } from 'components/visual/Inputs/components/ResetInput';
import React from 'react';
import { BaseListItemText } from './components/BaseListInput';
import type { ResetListInputProps } from './components/ResetListInput';
import { SkeletonListInput } from './components/SkeletonListInput';

type Props = Omit<SelectProps, 'defaultValue'> & {
  capitalize?: boolean;
  loading?: boolean;
  options: { label: MenuItemProps['children']; value: MenuItemProps['value'] }[];
  preventRender?: boolean;
  primary?: string;
  primaryProps?: ListItemTextProps<'span', 'p'>['primaryTypographyProps'];
  render?: boolean;
  reset?: boolean;
  resetProps?: ResetListInputProps;
  secondary?: ListItemTextProps['secondary'];
  secondaryProps?: ListItemTextProps<'span', 'p'>['secondaryTypographyProps'];
  onReset?: IconButtonProps['onClick'];
};

const WrappedSelectListInput = ({
  capitalize = false,
  disabled = false,
  id,
  loading = false,
  options = [],
  preventRender = false,
  primary,
  primaryProps = null,
  reset = false,
  resetProps = null,
  secondary,
  secondaryProps = null,
  value,
  onReset = () => null,
  ...selectProps
}: Props) =>
  preventRender ? null : (
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
          <ResetInput label={primary} preventRender={!reset || disabled} onReset={onReset} {...resetProps} />
          <Select
            variant="outlined"
            size="small"
            fullWidth
            disabled={disabled}
            sx={{
              maxWidth: '30%',
              ...(capitalize && { textTransform: 'capitalize' })
            }}
            value={value}
            inputProps={{ id }}
            {...selectProps}
          >
            {options.map((option, i) => (
              <MenuItem key={i} value={option.value} sx={{ ...(capitalize && { textTransform: 'capitalize' }) }}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </>
      )}
    </ListItem>
  );

export const SelectListInput = React.memo(WrappedSelectListInput);
