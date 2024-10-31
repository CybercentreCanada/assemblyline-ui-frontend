import ClearIcon from '@mui/icons-material/Clear';
import type { SelectProps, TypographyProps } from '@mui/material';
import { IconButton, MenuItem, Select, Skeleton, Typography, useTheme } from '@mui/material';
import React from 'react';

type Props = SelectProps & {
  label?: string;
  labelProps?: TypographyProps;
  loading?: boolean;
  items: string[];
  onReset?: () => void;
};

const WrappedSelectInput = ({
  label,
  labelProps,
  loading = false,
  items = [],
  value,
  disabled,
  onReset = null,
  ...other
}: Props) => {
  const theme = useTheme();

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
          <IconButton size="small" onClick={() => onReset()}>
            <ClearIcon style={{ width: theme.spacing(2.5), height: theme.spacing(2.5) }} />
          </IconButton>
        )}
      </div>

      {loading ? (
        <Skeleton style={{ height: '3rem' }} />
      ) : (
        <Select
          variant="outlined"
          size="small"
          fullWidth
          value={items.includes(value as string) ? value : ''}
          sx={{ textTransform: 'capitalize' }}
          {...other}
        >
          <MenuItem value="" sx={{ height: '36px' }}></MenuItem>
          {items.map((item, i) => (
            <MenuItem key={i} value={item} sx={{ textTransform: 'capitalize' }}>
              {item.replaceAll('_', ' ')}
            </MenuItem>
          ))}
        </Select>
      )}
    </div>
  );
};

export const SelectInput = React.memo(WrappedSelectInput);
