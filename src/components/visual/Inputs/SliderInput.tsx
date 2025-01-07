import type { IconButtonProps, SliderProps, TooltipProps, TypographyProps } from '@mui/material';
import { FormControl, Skeleton, Slider, Typography, useTheme } from '@mui/material';
import { Tooltip } from 'components/visual/Tooltip';
import React from 'react';
import type { ResetInputProps } from './components/ResetInput';
import { ResetInput } from './components/ResetInput';

type Props = Omit<SliderProps, 'onChange'> & {
  label: string;
  labelProps?: TypographyProps;
  loading?: boolean;
  preventDisabledColor?: boolean;
  preventRender?: boolean;
  reset?: boolean;
  resetProps?: ResetInputProps;
  tooltip?: TooltipProps['title'];
  tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
  onChange?: (event: Event, value: number) => void;
  onReset?: IconButtonProps['onClick'];
};

const WrappedSliderInput = ({
  disabled,
  id = null,
  label,
  labelProps,
  loading,
  preventDisabledColor = false,
  preventRender,
  reset = false,
  resetProps = null,
  tooltip = null,
  tooltipProps = null,
  onChange = () => null,
  onReset = () => null,
  ...sliderProps
}: Props) => {
  const theme = useTheme();

  return preventRender ? null : (
    <div>
      <Tooltip title={tooltip} {...tooltipProps}>
        <Typography
          color="textSecondary"
          gutterBottom
          overflow="hidden"
          textAlign="start"
          textOverflow="ellipsis"
          variant="body2"
          whiteSpace="nowrap"
          width="100%"
          sx={{
            ...(disabled &&
              !preventDisabledColor && {
                WebkitTextFillColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.38)'
              })
          }}
          {...labelProps}
          children={label}
        />
      </Tooltip>
      <FormControl fullWidth>
        {loading ? (
          <Skeleton sx={{ height: '40px', transform: 'unset' }} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, marginLeft: '20px', marginRight: '20px' }}>
              <Slider
                aria-label={id || label}
                id={id || label}
                disabled={disabled}
                valueLabelDisplay="auto"
                size="small"
                onChange={(e, v) => onChange(e, v as number)}
                {...sliderProps}
              />
            </div>
            <ResetInput id={id || label} preventRender={!reset || disabled} onReset={onReset} {...resetProps} />
          </div>
        )}
      </FormControl>
    </div>
  );
};

export const SliderInput = React.memo(WrappedSliderInput);
