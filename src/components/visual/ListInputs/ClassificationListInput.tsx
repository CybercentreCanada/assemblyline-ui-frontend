import type { FormHelperTextProps } from '@mui/material';
import { type IconButtonProps, type ListItemTextProps } from '@mui/material';
import type { ClassificationProps } from 'components/visual/Classification';
import Classification from 'components/visual/Classification';
import React, { useMemo } from 'react';
import { BaseListItem, BaseListItemText } from './components/BaseListInput';
import { ResetListInput, type ResetListInputProps } from './components/ResetListInput';
import { SkeletonListInput } from './components/SkeletonListInput';

type Props = Omit<ClassificationProps, 'c12n' | 'setClassification'> & {
  capitalize?: boolean;
  error?: (value: string) => string;
  errorProps?: FormHelperTextProps;
  id?: string;
  loading?: boolean;
  preventRender?: boolean;
  primary?: string;
  primaryProps?: ListItemTextProps<'span', 'p'>['primaryTypographyProps'];
  readOnly?: boolean;
  reset?: boolean;
  resetProps?: ResetListInputProps;
  secondary?: ListItemTextProps['secondary'];
  secondaryProps?: ListItemTextProps<'span', 'p'>['secondaryTypographyProps'];
  value: ClassificationProps['c12n'];
  onChange: ClassificationProps['setClassification'];
  onReset?: IconButtonProps['onClick'];
  onError?: (error: string) => void;
};

const WrappedClassificationListInput = ({
  capitalize = false,
  disabled = false,
  error = () => null,
  errorProps = null,
  id = null,
  loading = false,
  preventRender = false,
  primary,
  primaryProps = null,
  readOnly = false,
  reset = false,
  resetProps = null,
  secondary,
  secondaryProps = null,
  value,
  onChange = () => null,
  onReset = () => null,
  onError = () => null,
  ...classificationProps
}: Props) => {
  const errorValue = useMemo<string>(() => error(value), [error, value]);

  return preventRender ? null : (
    <BaseListItem
      disabled={disabled && !loading}
      error={errorValue && !disabled && !loading && !readOnly}
      helperText={errorValue}
      FormHelperTextProps={errorProps}
    >
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
          <ResetListInput
            id={id || primary}
            preventRender={!reset || disabled || readOnly}
            onReset={onReset}
            {...resetProps}
          />
          <div style={{ maxWidth: '30%', minWidth: '30%', width: '100%' }}>
            <Classification
              type={!disabled && !readOnly ? 'picker' : 'pill'}
              size="small"
              c12n={value}
              setClassification={c => {
                onChange(c);

                const err = error(c);
                if (err) onError(err);
              }}
              {...classificationProps}
            />
          </div>
        </>
      )}
    </BaseListItem>
  );
};

export const ClassificationListInput = React.memo(WrappedClassificationListInput);
