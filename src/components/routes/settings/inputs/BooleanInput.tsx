import type { ListItemButtonProps, ListItemTextProps, TypographyProps } from '@mui/material';
import { ListItem, ListItemButton, ListItemText, Skeleton, Switch, useTheme } from '@mui/material';
import React from 'react';

type Props = ListItemButtonProps & {
  primary?: ListItemTextProps['primary'];
  secondary?: ListItemTextProps['secondary'];
  primaryProps?: TypographyProps;
  loading?: boolean;
  value: boolean;
  capitalize?: boolean;
};

const WrappedBooleanInput = ({
  primary,
  secondary,
  primaryProps = null,
  loading = false,
  value,
  capitalize = false,
  ...other
}: Props) => {
  const theme = useTheme();

  return (
    <ListItem disablePadding sx={{ margin: `${theme.spacing(1)} 0` }}>
      <ListItemButton {...other}>
        <ListItemText
          primary={primary}
          secondary={secondary}
          style={{ marginRight: theme.spacing(2), margin: '0' }}
          primaryTypographyProps={{
            variant: 'body1',
            whiteSpace: 'nowrap',
            ...(capitalize && { textTransform: 'capitalize' }),
            ...primaryProps
          }}
        />
        {loading ? (
          <Skeleton style={{ height: '2rem', width: '2.5rem', marginRight: theme.spacing(0.5) }} />
        ) : (
          <Switch checked={value} edge="end" />
        )}
      </ListItemButton>
    </ListItem>
  );
};

export const BooleanInput = React.memo(WrappedBooleanInput);
