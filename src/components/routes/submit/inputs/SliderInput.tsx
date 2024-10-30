import type { SliderProps, TypographyProps } from '@mui/material';
import { Skeleton, Slider, Typography, useTheme } from '@mui/material';
import React from 'react';

type Props = SliderProps & {
  label?: string;
  labelProps?: TypographyProps;
  loading?: boolean;
};

const WrappedSliderInput = ({ label, labelProps, loading, ...other }: Props) => {
  const theme = useTheme();

  return (
    <div style={{ margin: `${theme.spacing(1)} 0px` }}>
      {label && (
        <Typography
          color="textSecondary"
          variant="caption"
          whiteSpace="nowrap"
          textTransform="capitalize"
          gutterBottom
          {...labelProps}
          children={label.replaceAll('_', ' ')}
        />
      )}
      {loading ? (
        <Skeleton style={{ height: '3rem' }} />
      ) : (
        <div style={{ marginLeft: '20px', marginRight: '20px' }}>
          <Slider valueLabelDisplay={'auto'} size="small" {...other} />
        </div>
      )}
    </div>
  );
};

export const SliderInput = React.memo(WrappedSliderInput);
