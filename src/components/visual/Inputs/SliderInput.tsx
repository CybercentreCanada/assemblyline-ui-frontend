import type { SliderProps, TypographyProps } from '@mui/material';
import { FormControl, InputLabel, Skeleton, Slider, Typography } from '@mui/material';
import React from 'react';

type Props = SliderProps & {
  label: string;
  labelProps?: TypographyProps;
  loading?: boolean;
};

const WrappedSliderInput = ({ label, labelProps, loading, disabled, ...sliderProps }: Props) => (
  <>
    <Typography
      component={InputLabel}
      htmlFor={label}
      variant="body2"
      whiteSpace="nowrap"
      textTransform="capitalize"
      gutterBottom
      {...labelProps}
      children={label}
    />
    <FormControl fullWidth>
      {loading ? (
        <Skeleton sx={{ height: '40px', transform: 'unset' }} />
      ) : (
        <div style={{ marginLeft: '20px', marginRight: '20px' }}>
          <Slider disabled={disabled} valueLabelDisplay="auto" size="small" {...sliderProps} />
        </div>
      )}
    </FormControl>
  </>
);

export const SliderInput = React.memo(WrappedSliderInput);
