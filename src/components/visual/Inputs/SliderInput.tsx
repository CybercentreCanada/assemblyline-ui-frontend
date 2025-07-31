import type { SliderProps } from '@mui/material';
import { FormControl, Slider } from '@mui/material';
import { HelperText, ResetInput } from 'components/visual/Inputs/lib/inputs.components';
import type { InputProps } from 'components/visual/Inputs/lib/inputs.model';
import React, { useMemo, useState } from 'react';

export type SliderInputProps = Omit<SliderProps, 'value' | 'onChange'> & InputProps<number>;

export const WrappedSliderInput = (props: SliderInputProps) => {
  return null;

  const {
    disabled,
    error = () => '',
    loading,
    preventRender,
    readOnly = false,
    rootProps = null,
    value = null,
    onBlur = () => null,
    onChange = () => null,
    onError = () => null,
    onFocus = () => null
  } = props;

  const [focused, setFocused] = useState<boolean>(false);

  const errorValue = useMemo<string>(() => error(value), [error, value]);

  return preventRender ? null : (
    <div {...rootProps} style={{ textAlign: 'left', ...rootProps?.style }}>
      <StyledFormLabel props={props} focused={focused} />
      <FormControl fullWidth error={!!errorValue}>
        {loading ? (
          <StyledInputSkeleton props={props} />
        ) : (
          <>
            <div style={{ minHeight: '40px', display: 'flex', alignItems: 'center' }}>
              <div style={{ flex: 1, marginLeft: '20px', marginRight: '20px' }}>
                <Slider
                  aria-label={getAriaLabel(props)}
                  id={getAriaLabel(props)}
                  color={!disabled && errorValue ? 'error' : 'primary'}
                  disabled={disabled || readOnly}
                  valueLabelDisplay="auto"
                  size="small"
                  value={value}
                  onChange={(e, v) => {
                    onChange(e, v);

                    const err = error(v);
                    if (err) onError(err);
                  }}
                  onFocus={(event, ...other) => {
                    setFocused(!readOnly && !disabled && document.activeElement === event.target);
                    onFocus(event, ...other);
                  }}
                  onBlur={(event, ...other) => {
                    setFocused(false);
                    onBlur(event, ...other);
                  }}
                />
              </div>
              <ResetInput props={props} />
            </div>
            <HelperText props={props} />
          </>
        )}
      </FormControl>
    </div>
  );
};
export const SliderInput: React.FC<SliderInputProps> = React.memo(WrappedSliderInput);
