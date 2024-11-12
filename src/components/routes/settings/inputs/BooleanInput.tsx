import RefreshIcon from '@mui/icons-material/Refresh';
import type { IconButtonProps, ListItemButtonProps, ListItemTextProps, TypographyProps } from '@mui/material';
import { IconButton, ListItem, ListItemButton, ListItemText, Skeleton, Switch, useTheme } from '@mui/material';
import React from 'react';

type Props = Omit<ListItemButtonProps, 'defaultValue'> & {
  capitalize?: boolean;
  defaultValue?: boolean;
  loading?: boolean;
  primary?: ListItemTextProps['primary'];
  primaryProps?: TypographyProps;
  secondary?: ListItemTextProps['secondary'];
  value: boolean;
  onReset?: IconButtonProps['onClick'];
};

const WrappedBooleanInput = ({
  capitalize = false,
  defaultValue = null,
  loading = false,
  primary,
  primaryProps = null,
  secondary,
  value,
  onReset = () => null,
  ...other
}: Props) => {
  const theme = useTheme();

  return (
    <ListItem disablePadding sx={{ margin: `${theme.spacing(1)} 0` }}>
      <ListItemButton sx={{ gap: theme.spacing(0.5) }} {...other}>
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
          <>
            <div style={{ ...((defaultValue === null || value === defaultValue) && { opacity: 0 }) }}>
              <IconButton
                color="primary"
                children={<RefreshIcon fontSize="small" />}
                onClick={event => {
                  event.preventDefault();
                  event.stopPropagation();
                  onReset(event);
                }}
              />
            </div>
            <Switch checked={value} edge="end" />
          </>
        )}
      </ListItemButton>
    </ListItem>
  );
};

export const BooleanInput = React.memo(WrappedBooleanInput);
