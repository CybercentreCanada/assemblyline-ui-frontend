import RefreshIcon from '@mui/icons-material/Refresh';
import type { IconButtonProps, ListItemTextProps, MenuItemProps, SelectProps, TypographyProps } from '@mui/material';
import { IconButton, ListItem, MenuItem, Select, Skeleton, Typography, useTheme } from '@mui/material';
import React, { useMemo } from 'react';

type Props = Omit<SelectProps, 'defaultValue'> & {
  capitalize?: boolean;
  customizable?: boolean;
  defaultValue?: string;
  loading?: boolean;
  options: { label: MenuItemProps['children']; value: MenuItemProps['value'] }[];
  primary?: ListItemTextProps['primary'];
  primaryProps?: TypographyProps;
  profileValue?: string;
  secondary?: ListItemTextProps['secondary'];
  onReset?: IconButtonProps['onClick'];
};

const WrappedSelectInput = ({
  capitalize = false,
  customizable = true,
  defaultValue = null,
  disabled: disabledProp = false,
  hidden: hiddenProp = false,
  loading = false,
  options = [],
  primary,
  primaryProps = null,
  profileValue = null,
  secondary,
  value,
  onReset = () => null,
  ...other
}: Props) => {
  const theme = useTheme();

  const selected = useMemo(() => (profileValue ?? value) || '', [profileValue, value]);

  const disabled = useMemo<boolean>(
    () => disabledProp || (!!profileValue && !customizable),
    [customizable, disabledProp, profileValue]
  );

  const showReset = useMemo<boolean>(() => !!defaultValue && value !== defaultValue, [defaultValue, value]);

  const hidden = useMemo<boolean>(() => hiddenProp && disabled, [disabled, hiddenProp]);

  return hidden ? null : (
    <ListItem disabled={disabled} sx={{ columnGap: theme.spacing(0.5), margin: `${theme.spacing(1)} 0` }}>
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

      {loading ? (
        <Skeleton height={40} style={{ width: '100%', maxWidth: '30%' }} />
      ) : (
        <Select
          variant="outlined"
          size="small"
          fullWidth
          disabled={disabled}
          sx={{ maxWidth: '30%', ...(capitalize && { textTransform: 'capitalize' }) }}
          value={selected}
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
