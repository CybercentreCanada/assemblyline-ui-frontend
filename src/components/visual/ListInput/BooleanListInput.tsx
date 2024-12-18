import type { IconButtonProps, ListItemButtonProps, ListItemTextProps } from '@mui/material';
import { Switch } from '@mui/material';
import React, { useMemo } from 'react';
import { BaseListItemButton, BaseListItemText } from './components/BaseListInput';
import type { ResetListInputProps } from './components/ResetListInput';
import { ResetListInput } from './components/ResetListInput';
import { SkeletonListInput } from './components/SkeletonListInput';

type Props = Omit<ListItemButtonProps, 'defaultValue'> & {
  primary?: ListItemTextProps['primary'];
  primaryProps?: ListItemTextProps<'span', 'p'>['primaryTypographyProps'];
  secondary?: ListItemTextProps['secondary'];
  secondaryProps?: ListItemTextProps<'span', 'p'>['secondaryTypographyProps'];

  value: boolean;
  capitalize?: boolean;
  render?: boolean;
  loading?: boolean;
  showReset?: boolean;
  resetProps?: ResetListInputProps;

  onReset?: IconButtonProps['onClick'];
};

const WrappedBooleanListInput = ({
  id,
  primary,
  primaryProps = null,
  secondary,
  secondaryProps = null,
  value,
  capitalize = false,
  disabled = false,
  render: renderProp = true,
  loading = false,
  showReset,
  resetProps = null,
  onReset = () => null,
  ...other
}: Props) => {
  const render = useMemo<boolean>(() => renderProp && disabled, [disabled, renderProp]);

  return !render ? null : (
    <BaseListItemButton disabled={disabled} {...other}>
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
          <Switch checked={value} edge="end" inputProps={{ id }} />
        </>
      )}
    </BaseListItemButton>
  );
};

export const BooleanListInput = React.memo(WrappedBooleanListInput);
