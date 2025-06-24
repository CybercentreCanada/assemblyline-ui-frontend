import type {
  FormHelperTextProps,
  IconButtonProps,
  SliderProps,
  TextFieldProps,
  TooltipProps,
  TypographyProps
} from '@mui/material';
import { FormControl, FormHelperText, Skeleton, Slider, Typography, useTheme } from '@mui/material';
import type { ResetInputProps } from 'components/visual/Inputs/components/ResetInput';
import { ResetInput } from 'components/visual/Inputs/components/ResetInput';
import { Tooltip } from 'components/visual/Tooltip';
import React, { useMemo, useState } from 'react';

export type SliderInputProps = Omit<SliderProps, 'value' | 'onChange'> & {
  endAdornment?: TextFieldProps['InputProps']['endAdornment'];
  error?: (value: number) => string;
  errorProps?: FormHelperTextProps;
  helperText?: string;
  helperTextProps?: FormHelperTextProps;
  label: string;
  labelProps?: TypographyProps;
  loading?: boolean;
  preventDisabledColor?: boolean;
  preventRender?: boolean;
  readOnly?: boolean;
  reset?: boolean;
  resetProps?: ResetInputProps;
  tiny?: boolean;
  tooltip?: TooltipProps['title'];
  tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
  value: number;
  onChange?: (event: Event, value: number) => void;
  onReset?: IconButtonProps['onClick'];
  onError?: (error: string) => void;
};

const WrappedSliderInput = ({
  disabled,
  endAdornment = null,
  error = () => null,
  errorProps = null,
  helperText = null,
  helperTextProps = null,
  id: idProp = null,
  label,
  labelProps,
  loading,
  preventDisabledColor = false,
  preventRender,
  readOnly = false,
  reset = false,
  resetProps = null,
  tiny = false,
  tooltip = null,
  tooltipProps = null,
  value,
  onChange = () => null,
  onReset = () => null,
  onError = () => null,
  ...sliderProps
}: SliderInputProps) => {
  const theme = useTheme();

  const [focused, setFocused] = useState<boolean>(false);

  const id = useMemo<string>(() => (idProp || label).replaceAll(' ', '-'), [idProp, label]);

  const errorValue = useMemo<string>(() => error(value), [error, value]);

  return preventRender ? null : (
    <div style={{ textAlign: 'left' }}>
      <Tooltip title={tooltip} {...tooltipProps}>
        <Typography
          color={!disabled && errorValue ? 'error' : focused ? 'primary' : 'textSecondary'}
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
          <Skeleton sx={{ height: '40px', transform: 'unset', ...(tiny && { height: '28px' }) }} />
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, marginLeft: '20px', marginRight: '20px' }}>
                <Slider
                  aria-label={id}
                  id={id}
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
                  onFocus={event => setFocused(document.activeElement === event.target)}
                  onBlur={() => setFocused(false)}
                  {...sliderProps}
                />
              </div>
              <ResetInput
                id={id}
                preventRender={loading || !reset || disabled || readOnly}
                onReset={onReset}
                {...resetProps}
              />
            </div>
            {disabled ? null : errorValue ? (
              <FormHelperText
                sx={{ color: theme.palette.error.main, ...errorProps?.sx }}
                variant="outlined"
                {...errorProps}
              >
                {errorValue}
              </FormHelperText>
            ) : helperText ? (
              <FormHelperText
                sx={{ color: theme.palette.text.secondary, ...helperTextProps?.sx }}
                variant="outlined"
                {...helperTextProps}
              >
                {helperText}
              </FormHelperText>
            ) : null}
          </>
        )}
      </FormControl>
    </div>
  );
};

export const SliderInput = React.memo(WrappedSliderInput);
