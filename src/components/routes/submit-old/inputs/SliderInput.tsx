import type { ListItemTextProps, SliderProps } from '@mui/material';
import { ListItem, Skeleton, Slider, Typography, useTheme } from '@mui/material';
import type { FieldPath } from 'components/core/form/utils';
import type { FormData } from 'components/routes/submit-old/form';
import { useForm } from 'components/routes/submit-old/form';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface Props extends SliderProps {
  primary?: ListItemTextProps['primary'];
  secondary?: ListItemTextProps['secondary'];
  storePath: (data: FieldPath<FormData>) => string;
}

const WrappedSliderInput = ({ primary, secondary, storePath = null, ...other }: Props) => {
  const { t, i18n } = useTranslation(['submit', 'settings']);
  const theme = useTheme();
  const form = useForm();

  return (
    <ListItem sx={{ columnGap: theme.spacing(2) }}>
      <div>
        {primary && (
          <Typography
            color="textPrimary"
            variant="body1"
            whiteSpace="nowrap"
            textTransform="capitalize"
            children={primary}
          />
        )}
        {secondary && <Typography color="textSecondary" variant="body2" children={secondary} />}
      </div>

      <form.Field
        field={store => store.settings.priority.toPath()}
        children={({ state, handleBlur, handleChange }) =>
          !form.state.values.settings ? (
            <Skeleton style={{ height: '3rem' }} />
          ) : (
            <div style={{ width: '100%', marginLeft: '20px', marginRight: '20px' }}>
              <Slider
                {...other}
                valueLabelDisplay={'auto'}
                size="small"
                value={state.value}
                onBlur={handleBlur}
                onChange={(_, value) => handleChange(value)}
              />
            </div>
          )
        }
      />
    </ListItem>
  );
};

export const SliderInput = React.memo(WrappedSliderInput);
