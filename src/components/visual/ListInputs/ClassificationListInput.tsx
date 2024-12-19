import { ListItem, type IconButtonProps, type ListItemTextProps } from '@mui/material';
import type { ClassificationProps } from 'components/visual/Classification';
import Classification from 'components/visual/Classification';
import { ResetInput } from 'components/visual/Inputs/components/ResetInput';
import React from 'react';
import { BaseListItemText } from './components/BaseListInput';
import type { ResetListInputProps } from './components/ResetListInput';
import { SkeletonListInput } from './components/SkeletonListInput';

type Props = Omit<ClassificationProps, 'c12n' | 'setClassification'> & {
  capitalize?: boolean;
  id: string;
  loading?: boolean;
  preventRender?: boolean;
  primary?: string;
  primaryProps?: ListItemTextProps<'span', 'p'>['primaryTypographyProps'];
  reset?: boolean;
  resetProps?: ResetListInputProps;
  secondary?: ListItemTextProps['secondary'];
  secondaryProps?: ListItemTextProps<'span', 'p'>['secondaryTypographyProps'];
  value: ClassificationProps['c12n'];
  onChange: ClassificationProps['setClassification'];
  onReset?: IconButtonProps['onClick'];
};

const WrappedClassificationListInput = ({
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
  onChange,
  onReset = () => null,
  ...classificationProps
}: Props) =>
  preventRender ? null : (
    <ListItem disabled={disabled} {...classificationProps}>
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
          <ResetInput label={primary} preventRender={!reset || disabled} onReset={onReset} {...resetProps} />
          <div style={{ maxWidth: '30%', width: '100%' }}>
            <Classification
              type={!disabled ? 'picker' : 'pill'}
              size="small"
              c12n={value}
              setClassification={onChange}
              {...classificationProps}
            />
          </div>
        </>
      )}
    </ListItem>
  );

export const ClassificationListInput = React.memo(WrappedClassificationListInput);
