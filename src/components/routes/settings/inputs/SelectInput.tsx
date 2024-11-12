import type { ListItemTextProps, MenuItemProps, SelectProps, TypographyProps } from '@mui/material';
import { ListItem, MenuItem, Select, Skeleton, Typography, useTheme } from '@mui/material';
import React from 'react';

type Props = SelectProps & {
  primary?: ListItemTextProps['primary'];
  secondary?: ListItemTextProps['secondary'];
  primaryProps?: TypographyProps;
  loading?: boolean;
  capitalize?: boolean;
  options: { label: MenuItemProps['children']; value: MenuItemProps['value'] }[];
};

const WrappedSelectInput = ({
  primary,
  secondary,
  primaryProps = null,
  loading = false,
  options = [],
  value,
  disabled = false,
  capitalize = false,
  ...other
}: Props) => {
  const theme = useTheme();

  return (
    <ListItem disabled={disabled} sx={{ columnGap: theme.spacing(2), margin: `${theme.spacing(1)} 0` }}>
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

      {loading ? (
        <Skeleton height={40} style={{ width: '100%', maxWidth: '30%' }} />
      ) : (
        <Select
          variant="outlined"
          size="small"
          fullWidth
          disabled={disabled}
          sx={{ maxWidth: '30%', ...(capitalize && { textTransform: 'capitalize' }) }}
          value={value || ''}
          {...other}
        >
          {options.map((option, i) => (
            <MenuItem key={i} value={option.value} sx={{ ...(capitalize && { textTransform: 'capitalize' }) }}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      )}
    </ListItem>
  );
};

export const SelectInput = React.memo(WrappedSelectInput);
