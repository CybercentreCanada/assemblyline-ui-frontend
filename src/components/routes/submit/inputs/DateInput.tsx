import ClearIcon from '@mui/icons-material/Clear';
import type { TypographyProps } from '@mui/material';
import { IconButton, Skeleton, Typography, useTheme } from '@mui/material';
import type { DatePickerProps } from 'components/visual/DatePicker';
import DatePicker from 'components/visual/DatePicker';
import React from 'react';

type Props = DatePickerProps & {
  label?: string;
  labelProps?: TypographyProps;
  loading?: boolean;
  onReset?: () => void;
};

const WrappedDateInput = ({ label, labelProps, loading = false, date, disabled, onReset = null, ...other }: Props) => {
  const theme = useTheme();

  return (
    <div style={{ margin: `${theme.spacing(1)} 0px` }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {label && (
          <Typography
            color="textSecondary"
            variant="caption"
            whiteSpace="nowrap"
            textTransform="capitalize"
            gutterBottom
            sx={{ flex: 1 }}
            {...labelProps}
            children={label.replaceAll('_', ' ')}
          />
        )}
        {onReset && !!date && !disabled && (
          <IconButton size="small" onClick={() => onReset()}>
            <ClearIcon style={{ width: theme.spacing(2.5), height: theme.spacing(2.5) }} />
          </IconButton>
        )}
      </div>

      {loading ? (
        <Skeleton style={{ height: '3rem' }} />
      ) : (
        <DatePicker date={date} type="input" disabled={disabled} {...other} />
      )}
    </div>
  );
};

export const DateInput = React.memo(WrappedDateInput);
