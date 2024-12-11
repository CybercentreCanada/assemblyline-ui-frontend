import RefreshIcon from '@mui/icons-material/Refresh';
import type { IconButtonProps, ListItemTextProps, OutlinedInputProps } from '@mui/material';
import { IconButton, InputAdornment, ListItem, OutlinedInput, Skeleton, Typography, useTheme } from '@mui/material';
import type { ReactNode } from 'react';
import React, { useMemo } from 'react';
import { InputListItem, InputListItemText, InputResetButton, InputSkeleton } from './Inputs';

type Props = Omit<OutlinedInputProps, 'value'> & {
  capitalize?: boolean;
  defaultValue?: number;
  endAdornment?: ReactNode;
  loading?: boolean;
  max?: number;
  min?: number;
  primary?: ListItemTextProps['primary'];
  primaryProps?: ListItemTextProps<'span', 'p'>['primaryTypographyProps'];
  secondary?: ListItemTextProps['secondary'];
  secondaryProps?: ListItemTextProps<'span', 'p'>['secondaryTypographyProps'];
  value: number;
  onReset?: IconButtonProps['onClick'];
};

const WrappedNumberInput = ({
  id,
  capitalize = false,
  defaultValue = null,
  disabled = false,
  endAdornment,
  hidden: hiddenProp = false,
  loading = false,
  max,
  min,
  primary,
  primaryProps = null,
  secondary,
  secondaryProps = null,
  value = null,
  onReset = () => null,
  ...other
}: Props) => {
  const theme = useTheme();

  const showReset = useMemo<boolean>(() => defaultValue !== null && value !== defaultValue, [defaultValue, value]);

  const hidden = useMemo<boolean>(() => hiddenProp && disabled, [disabled, hiddenProp]);

  return hidden ? null : (
    <InputListItem disabled={disabled}>
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
          <OutlinedInput
            type="number"
            margin="dense"
            size="small"
            fullWidth
            value={value}
            disabled={disabled}
            sx={{ maxWidth: '30%' }}
            inputProps={{ id, min, max }}
            endAdornment={endAdornment && <InputAdornment position="end">{endAdornment}</InputAdornment>}
            {...other}
          />
        </>
      )}
    </InputListItem>
  );

  return hidden ? null : (
    <ListItem disabled={disabled} sx={{ columnGap: theme.spacing(0.5) }}>
      <div style={{ flex: 1, margin: `${theme.spacing(0.5)} 0` }}>
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
        <OutlinedInput
          type="number"
          margin="dense"
          size="small"
          fullWidth
          value={value}
          disabled={disabled}
          sx={{ maxWidth: '30%' }}
          inputProps={{ min: min, max: max }}
          endAdornment={endAdornment && <InputAdornment position="end">{endAdornment}</InputAdornment>}
          {...other}
        />
      )}
    </ListItem>
  );
};

export const NumberInput = React.memo(WrappedNumberInput);
