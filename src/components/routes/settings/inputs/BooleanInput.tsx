import RefreshIcon from '@mui/icons-material/Refresh';
import type { IconButtonProps, ListItemButtonProps, ListItemTextProps } from '@mui/material';
import { IconButton, ListItem, ListItemButton, ListItemText, Skeleton, Switch, useTheme } from '@mui/material';
import React, { useMemo } from 'react';
import { InputListItemButton, InputListItemText, InputResetButton, InputSkeleton } from './Inputs';

type Props = Omit<ListItemButtonProps, 'defaultValue'> & {
  capitalize?: boolean;
  defaultValue?: boolean;
  loading?: boolean;
  primary?: ListItemTextProps['primary'];
  primaryProps?: ListItemTextProps<'span', 'p'>['primaryTypographyProps'];
  secondary?: ListItemTextProps['secondary'];
  secondaryProps?: ListItemTextProps<'span', 'p'>['secondaryTypographyProps'];
  value: boolean;
  onReset?: IconButtonProps['onClick'];
};

const WrappedBooleanInput = ({
  id,
  capitalize = false,
  defaultValue = null,
  disabled = false,
  hidden: hiddenProp = false,
  loading = false,
  primary,
  primaryProps = null,
  secondary,
  secondaryProps = null,
  value,
  onReset = () => null,
  ...other
}: Props) => {
  const theme = useTheme();

  const showReset = useMemo<boolean>(() => defaultValue !== null && value !== defaultValue, [defaultValue, value]);

  const hidden = useMemo<boolean>(() => hiddenProp && disabled, [disabled, hiddenProp]);

  return hidden ? null : (
    <InputListItemButton disabled={disabled} {...other}>
      <InputListItemText
        primary={<label htmlFor={id}>{primary}</label>}
        secondary={secondary}
        primaryTypographyProps={{ sx: { textTransform: capitalize ? 'capitalize' : null }, ...primaryProps }}
        secondaryTypographyProps={secondaryProps}
      />
      {loading ? (
        <InputSkeleton />
      ) : (
        <>
          <InputResetButton visible={showReset} onClick={onReset} />
          <Switch checked={value} edge="end" inputProps={{ id }} />
        </>
      )}
    </InputListItemButton>
  );

  return hidden ? null : (
    <ListItem disablePadding>
      <ListItemButton disabled={disabled} sx={{ gap: theme.spacing(0.5) }} {...other}>
        <ListItemText
          primary={primary}
          secondary={secondary}
          style={{ marginRight: theme.spacing(2), margin: `${theme.spacing(0.5)} 0` }}
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
            <Switch checked={value} edge="end" />
          </>
        )}
      </ListItemButton>
    </ListItem>
  );
};

export const BooleanInput = React.memo(WrappedBooleanInput);
