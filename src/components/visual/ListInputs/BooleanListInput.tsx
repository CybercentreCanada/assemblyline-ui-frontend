import type { IconButtonProps, ListItemButtonProps, ListItemTextProps } from '@mui/material';
import { Switch } from '@mui/material';
import React from 'react';
import { BaseListItemButton, BaseListItemText } from './components/BaseListInput';
import { ResetListInput, type ResetListInputProps } from './components/ResetListInput';
import { SkeletonListInput } from './components/SkeletonListInput';

type Props = Omit<ListItemButtonProps, 'defaultValue'> & {
  capitalize?: boolean;
  loading?: boolean;
  preventRender?: boolean;
  primary?: string;
  primaryProps?: ListItemTextProps<'span', 'p'>['primaryTypographyProps'];
  reset?: boolean;
  resetProps?: ResetListInputProps;
  secondary?: ListItemTextProps['secondary'];
  secondaryProps?: ListItemTextProps<'span', 'p'>['secondaryTypographyProps'];
  value: boolean;
  onReset?: IconButtonProps['onClick'];
};

const WrappedBooleanListInput = ({
  capitalize = false,
  disabled = false,
  id,
  loading = false,
  preventRender = false,
  primary,
  primaryProps = null,
  reset = false,
  resetProps = null,
  secondary,
  secondaryProps = null,
  value,
  onReset = () => null,
  ...buttonProps
}: Props) =>
  preventRender ? null : (
    <BaseListItemButton disabled={disabled} {...buttonProps}>
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
          <Switch checked={value} edge="end" inputProps={{ id }} />
        </>
      )}
    </BaseListItemButton>
  );

export const BooleanListInput = React.memo(WrappedBooleanListInput);
