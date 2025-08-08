import type { FormHelperTextProps, IconButtonProps, ListItemTextProps } from '@mui/material';
import { useTheme } from '@mui/material';
import type { ClassificationProps } from 'components/visual/Classification';
import Classification from 'components/visual/Classification';
import { ListItemText } from 'components/visual/List/ListItemText';
import { BaseListItem } from 'components/visual/ListInputs/components/BaseListInput';
import { ResetListInput, type ResetListInputProps } from 'components/visual/ListInputs/components/ResetListInput';
import { SkeletonListInput } from 'components/visual/ListInputs/components/SkeletonListInput';
import React, { useMemo } from 'react';

type Props = Omit<ClassificationProps, 'c12n' | 'setClassification'> & {
  capitalize?: boolean;
  defaultValue?: ClassificationProps['c12n'];
  error?: (value: string) => string;
  errorProps?: FormHelperTextProps;
  id?: string;
  inset?: boolean;
  loading?: boolean;
  preventRender?: boolean;
  primary?: React.ReactNode;
  primaryProps?: ListItemTextProps<'span', 'p'>['primaryTypographyProps'];
  readOnly?: boolean;
  reset?: boolean;
  resetProps?: ResetListInputProps;
  secondary?: React.ReactNode;
  secondaryProps?: ListItemTextProps<'span', 'p'>['secondaryTypographyProps'];
  value: ClassificationProps['c12n'];
  onChange: ClassificationProps['setClassification'];
  onReset?: IconButtonProps['onClick'];
  onError?: (error: string) => void;
};

const WrappedClassificationListInput = ({
  capitalize = false,
  defaultValue,
  disabled = false,
  error = () => null,
  errorProps = null,
  id = null,
  inset = false,
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
  onError = () => null,
  onReset = null,
  ...classificationProps
}: Props) => {
  const theme = useTheme();

  const errorValue = useMemo<string>(() => error(value), [error, value]);

  return preventRender ? null : (
    <BaseListItem
      disabled={disabled && !loading}
      error={errorValue && !disabled && !loading && !readOnly}
      helperText={errorValue}
      FormHelperTextProps={errorProps}
    >
      <ListItemText
        id={id}
        primary={primary}
        secondary={secondary}
        primaryTypographyProps={primaryProps}
        secondaryTypographyProps={secondaryProps}
        capitalize={capitalize}
        style={{
          marginRight: theme.spacing(2),
          margin: `${theme.spacing(0.25)} 0`,
          ...(inset && { marginLeft: '42px' })
        }}
      />
      {loading ? (
        <SkeletonListInput />
      ) : (
        <>
          <ResetListInput
            defaultValue={defaultValue}
            id={id || primary.toString()}
            preventRender={!reset || disabled || readOnly}
            onChange={() => onChange(defaultValue)}
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
