import type { ListItemTextProps, TypographyProps } from '@mui/material';
import { ListItem, Skeleton, Typography, useTheme } from '@mui/material';
import type { ClassificationProps } from 'components/visual/Classification';
import Classification from 'components/visual/Classification';
import React from 'react';

type Props = Omit<ClassificationProps, 'c12n' | 'setClassification'> & {
  primary?: ListItemTextProps['primary'];
  secondary?: ListItemTextProps['secondary'];
  primaryProps?: TypographyProps;
  loading?: boolean;
  value: ClassificationProps['c12n'];
  onChange: ClassificationProps['setClassification'];
};

const WrappedClassificationInput = ({
  primary,
  secondary,
  primaryProps = null,
  loading = false,
  disabled = false,
  value,
  onChange,
  ...other
}: Props) => {
  const theme = useTheme();

  return (
    <ListItem disabled={disabled} sx={{ columnGap: theme.spacing(2), margin: `${theme.spacing(1)} 0` }}>
      <div style={{ flex: 1 }}>
        {primary && (
          <Typography color="textPrimary" variant="body1" whiteSpace="nowrap" children={primary} {...primaryProps} />
        )}
        {secondary && <Typography color="textSecondary" variant="body2" children={secondary} />}
      </div>

      {loading ? (
        <Skeleton height={40} style={{ width: '100%', maxWidth: '30%' }} />
      ) : (
        <div style={{ maxWidth: '30%', width: '100%' }}>
          <Classification
            type={!disabled ? 'picker' : 'pill'}
            size="small"
            c12n={value}
            setClassification={onChange}
            {...other}
          />
        </div>
      )}
    </ListItem>
  );
};

export const ClassificationInput = React.memo(WrappedClassificationInput);
