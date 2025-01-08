import type { FormHelperTextProps, IconButtonProps, SliderProps, TooltipProps, TypographyProps } from '@mui/material';
import { FormControl, FormHelperText, Skeleton, Slider, Typography, useTheme } from '@mui/material';
import { Tooltip } from 'components/visual/Tooltip';
import React, { useMemo } from 'react';
import type { ResetInputProps } from './components/ResetInput';
import { ResetInput } from './components/ResetInput';

type Props = Omit<SliderProps, 'value' | 'onChange'> & {
  error?: (value: number) => string;
  errorProps?: FormHelperTextProps;
  label: string;
  labelProps?: TypographyProps;
  loading?: boolean;
  preventDisabledColor?: boolean;
  preventRender?: boolean;
  readOnly?: boolean;
  reset?: boolean;
  resetProps?: ResetInputProps;
  tooltip?: TooltipProps['title'];
  tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
  value: number;
  onChange?: (event: Event, value: number) => void;
  onReset?: IconButtonProps['onClick'];
  onError?: (error: string) => void;
};

const WrappedSliderInput = ({
  disabled,
  error = () => null,
  errorProps = null,
  id = null,
  label,
  labelProps,
  loading,
  preventDisabledColor = false,
  preventRender,
  readOnly = false,
  reset = false,
  resetProps = null,
  tooltip = null,
  tooltipProps = null,
  value,
  onChange = () => null,
  onReset = () => null,
  onError = () => null,
  ...sliderProps
}: Props) => {
  const theme = useTheme();

  const errorValue = useMemo<string>(() => error(value), [error, value]);

  return preventRender ? null : (
    <div>
      <Tooltip title={tooltip} {...tooltipProps}>
        <Typography
          color={!disabled && errorValue ? 'error' : 'textSecondary'}
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
      <FormControl fullWidth error={!!errorValue}>
        {loading ? (
          <Skeleton sx={{ height: '40px', transform: 'unset' }} />
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, marginLeft: '20px', marginRight: '20px' }}>
                <Slider
                  aria-label={id || label}
                  id={id || label}
                  color={!disabled && errorValue ? 'error' : 'primary'}
                  disabled={disabled || readOnly}
                  valueLabelDisplay="auto"
                  size="small"
                  value={value}
                  onChange={(e, v) => {
                    onChange(e, v as number);

                    const err = error(v as number);
                    if (err) onError(err);
                  }}
                  {...sliderProps}
                />
              </div>
              <ResetInput
                id={id || label}
                preventRender={loading || !reset || disabled || readOnly}
                onReset={onReset}
                {...resetProps}
              />
            </div>
            {!errorValue || disabled ? null : (
              <FormHelperText
                sx={{ color: theme.palette.error.main, ...errorProps?.sx }}
                variant="outlined"
                {...errorProps}
              >
                {errorValue}
              </FormHelperText>
            )}
          </>
        )}
      </FormControl>
    </div>
  );
};

export const SliderInput = React.memo(WrappedSliderInput);
