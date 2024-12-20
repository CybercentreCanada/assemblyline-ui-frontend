import type { IconButtonProps, TypographyProps } from '@mui/material';
import { FormControl, InputLabel, Skeleton, Typography } from '@mui/material';
import type { DatePickerProps } from 'components/visual/DatePicker';
import DatePicker from 'components/visual/DatePicker';
import React from 'react';
import type { ResetInputProps } from './components/ResetInput';

type Props = Omit<DatePickerProps, 'date' | 'setDate'> & {
  id?: string;
  label?: string;
  labelProps?: TypographyProps;
  loading?: boolean;
  preventRender?: boolean;
  reset?: boolean;
  resetProps?: ResetInputProps;
  value: string;
  onChange?: (value: string) => void;
  onReset?: IconButtonProps['onClick'];
};

const WrappedDateInput = ({
  disabled,
  id = null,
  label,
  labelProps,
  loading = false,
  preventRender = false,
  reset = false,
  resetProps = null,
  value,
  onChange = () => null,
  onReset = () => null,
  ...dateProps
}: Props) => {
  return preventRender ? null : (
    <div>
      <Typography
        component={InputLabel}
        htmlFor={id || label}
        variant="body2"
        whiteSpace="nowrap"
        gutterBottom
        {...labelProps}
        children={label}
      />
      <FormControl fullWidth>
        {loading ? (
          <Skeleton sx={{ height: '40px', transform: 'unset' }} />
        ) : (
          <>
            <DatePicker
              type="input"
              date={value}
              disabled={disabled}
              setDate={onChange}
              textFieldProps={{ id: id || label }}
              {...dateProps}
            />
          </>
        )}
      </FormControl>
    </div>
  );
};

export const DateInput = React.memo(WrappedDateInput);
