import type { IconButtonProps, ListItemTextProps, OutlinedInputProps } from '@mui/material';
import { InputAdornment, ListItem, OutlinedInput } from '@mui/material';
import type { ReactNode } from 'react';
import React from 'react';
import { BaseListItemText } from './components/BaseListInput';
import type { ResetListInputProps } from './components/ResetListInput';
import { ResetListInput } from './components/ResetListInput';
import { SkeletonListInput } from './components/SkeletonListInput';

type Props = Omit<OutlinedInputProps, 'value'> & {
  capitalize?: boolean;
  endAdornment?: ReactNode;
  loading?: boolean;
  max?: number;
  min?: number;
  preventRender?: boolean;
  primary?: string;
  primaryProps?: ListItemTextProps<'span', 'p'>['primaryTypographyProps'];
  reset?: boolean;
  resetProps?: ResetListInputProps;
  secondary?: ListItemTextProps['secondary'];
  secondaryProps?: ListItemTextProps<'span', 'p'>['secondaryTypographyProps'];
  value: number;
  onReset?: IconButtonProps['onClick'];
};

const WrappedNumberListInput = ({
  capitalize = false,
  disabled = false,
  endAdornment,
  id,
  loading = false,
  max,
  min,
  preventRender = false,
  primary,
  primaryProps = null,
  reset = false,
  resetProps = null,
  secondary,
  secondaryProps = null,
  value,
  onReset = () => null,
  ...inputProps
}: Props) =>
  preventRender ? null : (
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
          <ResetListInput id={primary} preventRender={!reset || disabled} onReset={onReset} {...resetProps} />
          <OutlinedInput
            type="number"
            margin="dense"
            size="small"
            fullWidth
            value={value.toString()}
            disabled={disabled}
            sx={{ maxWidth: '30%' }}
            inputProps={{ id, min, max }}
            endAdornment={endAdornment && <InputAdornment position="end">{endAdornment}</InputAdornment>}
            {...inputProps}
          />
        </>
      )}
    </ListItem>
  );

export const NumberListInput = React.memo(WrappedNumberListInput);
