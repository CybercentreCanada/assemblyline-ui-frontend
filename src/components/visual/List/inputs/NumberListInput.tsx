import type { IconButtonProps, ListItemTextProps, OutlinedInputProps } from '@mui/material';
import { InputAdornment, ListItem, OutlinedInput } from '@mui/material';
import type { ReactNode } from 'react';
import React, { useMemo } from 'react';
import { BaseListItemText } from './BaseListInput';
import type { ResetListInputProps } from './ResetListInput';
import { ResetListInput } from './ResetListInput';
import { SkeletonListInput } from './SkeletonListInput';

type Props = Omit<OutlinedInputProps, 'value'> & {
  primary?: ListItemTextProps['primary'];
  primaryProps?: ListItemTextProps<'span', 'p'>['primaryTypographyProps'];
  secondary?: ListItemTextProps['secondary'];
  secondaryProps?: ListItemTextProps<'span', 'p'>['secondaryTypographyProps'];

  value: number;
  capitalize?: boolean;
  hidden?: boolean;
  loading?: boolean;
  showReset?: boolean;
  resetProps?: ResetListInputProps;

  max?: number;
  min?: number;
  endAdornment?: ReactNode;

  onReset?: IconButtonProps['onClick'];
};

const WrappedNumberListInput = ({
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

  max,
  min,
  endAdornment,

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
    </ListItem>
  );
};

export const NumberListInput = React.memo(WrappedNumberListInput);
