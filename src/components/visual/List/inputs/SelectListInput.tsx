import type { IconButtonProps, ListItemTextProps, MenuItemProps, SelectProps } from '@mui/material';
import { ListItem, MenuItem, Select } from '@mui/material';
import React, { useMemo } from 'react';
import { BaseListItemText } from './BaseListInput';
import type { ResetListInputProps } from './ResetListInput';
import { ResetListInput } from './ResetListInput';
import { SkeletonListInput } from './SkeletonListInput';

type Props = Omit<SelectProps, 'defaultValue'> & {
  primary?: ListItemTextProps['primary'];
  primaryProps?: ListItemTextProps<'span', 'p'>['primaryTypographyProps'];
  secondary?: ListItemTextProps['secondary'];
  secondaryProps?: ListItemTextProps<'span', 'p'>['secondaryTypographyProps'];

  capitalize?: boolean;
  hidden?: boolean;
  loading?: boolean;
  showReset?: boolean;
  resetProps?: ResetListInputProps;
  options: { label: MenuItemProps['children']; value: MenuItemProps['value'] }[];

  onReset?: IconButtonProps['onClick'];
};

const WrappedSelectListInput = ({
  id,
  primary,
  primaryProps = null,
  secondary,
  secondaryProps = null,

  value,
  capitalize = false,
  disabled = false,
  hidden: hiddenProp = false,
  loading = false,
  showReset,
  resetProps = null,
  options = [],

  onReset = () => null,
  ...other
}: Props) => {
  const hidden = useMemo<boolean>(() => hiddenProp && disabled, [disabled, hiddenProp]);

  return hidden ? null : (
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
          {showReset === null ? null : <ResetListInput visible={showReset} onClick={onReset} {...resetProps} />}
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
            {...other}
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
};

export const SelectListInput = React.memo(WrappedSelectListInput);
