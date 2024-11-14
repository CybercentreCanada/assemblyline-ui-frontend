import RefreshIcon from '@mui/icons-material/Refresh';
import type { ListItemTextProps, TypographyProps } from '@mui/material';
import { IconButton, ListItem, Skeleton, Typography, useTheme } from '@mui/material';
import type { ClassificationProps } from 'components/visual/Classification';
import Classification from 'components/visual/Classification';
import React, { useMemo } from 'react';

type Props = Omit<ClassificationProps, 'c12n' | 'setClassification'> & {
  customizable?: boolean;
  defaultValue?: ClassificationProps['c12n'];
  hidden?: boolean;
  loading?: boolean;
  primary?: ListItemTextProps['primary'];
  primaryProps?: TypographyProps;
  profileValue?: ClassificationProps['c12n'];
  secondary?: ListItemTextProps['secondary'];
  value: ClassificationProps['c12n'];
  onChange: ClassificationProps['setClassification'];
  onReset?: ClassificationProps['setClassification'];
};

const WrappedClassificationInput = ({
  customizable = true,
  defaultValue = null,
  disabled: disabledProp = false,
  hidden: hiddenProp = false,
  loading = false,
  primary,
  primaryProps = null,
  profileValue = null,
  secondary,
  value,
  onChange,
  onReset = () => null,
  ...other
}: Props) => {
  const theme = useTheme();

  const c12n = useMemo(() => (profileValue ?? value) || '', [profileValue, value]);

  const disabled = useMemo<boolean>(
    () => disabledProp || (!!profileValue && !customizable),
    [customizable, disabledProp, profileValue]
  );

  const showReset = useMemo<boolean>(() => !!defaultValue && value !== defaultValue, [defaultValue, value]);

  const hidden = useMemo<boolean>(() => hiddenProp && disabled, [disabled, hiddenProp]);

  return hidden ? null : (
    <ListItem disabled={disabled} sx={{ columnGap: theme.spacing(2), margin: `${theme.spacing(1)} 0` }}>
      <div style={{ flex: 1 }}>
        {primary && (
          <Typography color="textPrimary" variant="body1" whiteSpace="nowrap" children={primary} {...primaryProps} />
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
            onReset(defaultValue);
          }}
        />
      </div>

      {loading ? (
        <Skeleton height={40} style={{ width: '100%', maxWidth: '30%' }} />
      ) : (
        <div style={{ maxWidth: '30%', width: '100%' }}>
          <Classification
            type={!disabled ? 'picker' : 'pill'}
            size="small"
            c12n={c12n}
            setClassification={onChange}
            {...other}
          />
        </div>
      )}
    </ListItem>
  );
};

export const ClassificationInput = React.memo(WrappedClassificationInput);
