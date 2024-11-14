import RefreshIcon from '@mui/icons-material/Refresh';
import type { IconButtonProps, ListItemButtonProps, ListItemTextProps, TypographyProps } from '@mui/material';
import { IconButton, ListItem, ListItemButton, ListItemText, Skeleton, Switch, useTheme } from '@mui/material';
import React, { useMemo } from 'react';

type Props = Omit<ListItemButtonProps, 'defaultValue'> & {
  capitalize?: boolean;
  customizable?: boolean;
  defaultValue?: boolean;
  loading?: boolean;
  primary?: ListItemTextProps['primary'];
  primaryProps?: TypographyProps;
  profileValue?: boolean;
  secondary?: ListItemTextProps['secondary'];
  value: boolean;
  onReset?: IconButtonProps['onClick'];
};

const WrappedBooleanInput = ({
  capitalize = false,
  customizable = true,
  defaultValue = null,
  disabled: disabledProp = false,
  hidden: hiddenProp = false,
  loading = false,
  primary,
  primaryProps = null,
  profileValue = null,
  secondary,
  value,
  onReset = () => null,
  ...other
}: Props) => {
  const theme = useTheme();

  const checked = useMemo(() => profileValue ?? value, [profileValue, value]);

  const disabled = useMemo<boolean>(
    () => disabledProp || (!!profileValue && !customizable),
    [customizable, disabledProp, profileValue]
  );

  const showReset = useMemo<boolean>(() => !!defaultValue && value !== defaultValue, [defaultValue, value]);

  const hidden = useMemo<boolean>(() => hiddenProp && disabled, [disabled, hiddenProp]);

  return hidden ? null : (
    <ListItem disablePadding sx={{ margin: `${theme.spacing(1)} 0` }}>
      <ListItemButton disabled={disabled} sx={{ gap: theme.spacing(0.5) }} {...other}>
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
            <div style={{ ...(!showReset && { opacity: 0 }) }}>
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
            <Switch checked={checked} edge="end" />
          </>
        )}
      </ListItemButton>
    </ListItem>
  );
};

export const BooleanInput = React.memo(WrappedBooleanInput);
