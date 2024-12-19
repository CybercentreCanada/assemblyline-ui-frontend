import type { IconButtonProps, SliderProps, TypographyProps } from '@mui/material';
import { FormControl, Skeleton, Slider, Typography } from '@mui/material';
import React from 'react';
import type { ResetInputProps } from './components/ResetInput';
import { ResetInput } from './components/ResetInput';

type Props = SliderProps & {
  label: string;
  labelProps?: TypographyProps;
  loading?: boolean;
  preventRender?: boolean;
  reset?: boolean;
  resetProps?: ResetInputProps;
  onReset?: IconButtonProps['onClick'];
};

const WrappedSliderInput = ({
  disabled,
  label,
  labelProps,
  loading,
  preventRender,
  reset = false,
  resetProps = null,
  onReset = () => null,
  ...sliderProps
}: Props) =>
  preventRender ? null : (
    <div>
      <Typography
        color="textSecondary"
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
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, marginLeft: '20px', marginRight: '20px' }}>
              <Slider
                aria-label={label}
                id={label}
                disabled={disabled}
                valueLabelDisplay="auto"
                size="small"
                {...sliderProps}
              />
            </div>
            <ResetInput label={label} preventRender={!reset || disabled} onReset={onReset} {...resetProps} />
          </div>
        )}
      </FormControl>
    </div>
  );

export const SliderInput = React.memo(WrappedSliderInput);
