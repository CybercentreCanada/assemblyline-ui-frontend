import { ListItem, type IconButtonProps, type ListItemTextProps } from '@mui/material';
import type { ClassificationProps } from 'components/visual/Classification';
import Classification from 'components/visual/Classification';
import React, { useMemo } from 'react';
import { BaseListItemText } from './BaseListInput';
import type { ResetListInputProps } from './ResetListInput';
import { ResetListInput } from './ResetListInput';
import { SkeletonListInput } from './SkeletonListInput';

type Props = Omit<ClassificationProps, 'c12n' | 'setClassification'> & {
  id: string;
  primary?: ListItemTextProps['primary'];
  primaryProps?: ListItemTextProps<'span', 'p'>['primaryTypographyProps'];
  secondary?: ListItemTextProps['secondary'];
  secondaryProps?: ListItemTextProps<'span', 'p'>['secondaryTypographyProps'];

  value: ClassificationProps['c12n'];
  capitalize?: boolean;
  render?: boolean;
  loading?: boolean;
  showReset?: boolean;
  resetProps?: ResetListInputProps;

  onChange: ClassificationProps['setClassification'];
  onReset?: IconButtonProps['onClick'];
};

const WrappedClassificationListInput = ({
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
  onChange,
  onReset = () => null,
  ...other
}: Props) => {
  const render = useMemo<boolean>(() => renderProp && disabled, [disabled, renderProp]);

  return !render ? null : (
    <ListItem disabled={disabled} {...other}>
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
          <div style={{ maxWidth: '30%', width: '100%' }}>
            <Classification
              type={!disabled ? 'picker' : 'pill'}
              size="small"
              c12n={value}
              setClassification={onChange}
              {...other}
            />
          </div>
        </>
      )}
    </ListItem>
  );
};

export const ClassificationListInput = React.memo(WrappedClassificationListInput);
