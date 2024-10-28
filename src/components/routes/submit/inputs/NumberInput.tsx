import type { ListItemTextProps, OutlinedInputProps } from '@mui/material';
import { InputAdornment, ListItem, OutlinedInput, Skeleton, Typography, useTheme } from '@mui/material';
import { useForm } from 'components/routes/submit/form';
import type { ReactNode } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';

type Props = Omit<OutlinedInputProps, ''> & {
  primary?: ListItemTextProps['primary'];
  secondary?: ListItemTextProps['secondary'];
  min?: number;
  max?: number;
  endAdornment?: ReactNode;
};

const WrappedNumberInput = ({ primary, secondary, min, max, endAdornment, ...other }: Props) => {
  const { t, i18n } = useTranslation(['submit', 'settings']);
  const theme = useTheme();
  const form = useForm();

  return (
    <ListItem sx={{ justifyContent: 'space-between' }}>
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

      {!form.state.values.settings ? (
        <Skeleton style={{ height: '3rem' }} />
      ) : (
        <OutlinedInput
          type="number"
          margin="dense"
          size="small"
          fullWidth
          inputProps={{ min: min, max: max, style: { textAlign: 'right' } }}
          endAdornment={endAdornment && <InputAdornment position="end">{endAdornment}</InputAdornment>}
          style={{ width: '125px' }}
          {...other}
        />
      )}

      {/* <form.Field
        field={storePath as any}
        children={({ state, handleBlur, handleChange }) =>
          !form.state.values.settings ? (
            <Skeleton style={{ height: '3rem' }} />
          ) : (
            <OutlinedInput
              {...other}
              id="ttl"
              type="number"
              margin="dense"
              size="small"
              value={state.value}
              onBlur={handleBlur}
              onChange={event => handleChange(event.target.value)}
              fullWidth
              inputProps={{ min: min, max: max, style: { textAlign: 'right' } }}
              endAdornment={endAdornment && <InputAdornment position="end">{endAdornment}</InputAdornment>}
              style={{ width: '125px' }}
            />
          )
        }
      /> */}
    </ListItem>
  );
};

export const NumberInput = React.memo(WrappedNumberInput);
