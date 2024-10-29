import type { ListItemTextProps, SelectProps } from '@mui/material';
import { ListItem, MenuItem, Select, Skeleton, Typography, useTheme } from '@mui/material';
import React from 'react';

type Props = SelectProps & {
  primary?: ListItemTextProps['primary'];
  secondary?: ListItemTextProps['secondary'];
  loading?: boolean;
  items: string[];
};

const WrappedEnumInput = ({ primary, secondary, loading = false, items = [], value, ...other }: Props) => {
  const theme = useTheme();

  return (
    <ListItem sx={{ columnGap: theme.spacing(2) }}>
      <div>
        {primary && (
          <Typography
            color="textPrimary"
            variant="body1"
            whiteSpace="nowrap"
            textTransform="capitalize"
            children={primary}
          />
        )}
        {secondary && <Typography color="textSecondary" variant="body2" children={secondary} />}
      </div>

      {loading ? (
        <Skeleton style={{ height: '3rem' }} />
      ) : (
        <Select variant="outlined" size="small" fullWidth value={value || ''} {...other}>
          {items.map((item, i) => (
            <MenuItem key={i} value={item}>
              {item}
            </MenuItem>
          ))}
        </Select>
      )}
    </ListItem>
  );
};

export const EnumInput = React.memo(WrappedEnumInput);
