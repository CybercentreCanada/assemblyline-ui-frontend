import type {
  FormHelperTextProps,
  IconButtonProps,
  TextFieldProps,
  TooltipProps,
  TypographyProps
} from '@mui/material';
import { FormControl, InputAdornment, InputLabel, Skeleton, Typography, useTheme } from '@mui/material';
import { LocalizationProvider, DatePicker as MuiDatePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import type { ResetInputProps } from 'components/visual/Inputs/components/ResetInput';
import { ResetInput } from 'components/visual/Inputs/components/ResetInput';
import { Tooltip } from 'components/visual/Tooltip';
import type { Moment } from 'moment';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react';

export type DateInputProps = Omit<TextFieldProps, 'error' | 'value' | 'onChange'> & {
  defaultDateOffset?: number | null;
  endAdornment?: TextFieldProps['InputProps']['endAdornment'];
  error?: (value: string) => string;
  errorProps?: FormHelperTextProps;
  helperText?: string;
  helperTextProps?: FormHelperTextProps;
  id?: string;
  label?: string;
  labelProps?: TypographyProps;
  loading?: boolean;
  maxDateToday?: boolean;
  minDateTomorrow?: boolean;
  placeholder?: TextFieldProps['InputProps']['placeholder'];
  preventDisabledColor?: boolean;
  preventRender?: boolean;
  readOnly?: boolean;
  reset?: boolean;
  resetProps?: ResetInputProps;
  tiny?: boolean;
  tooltip?: TooltipProps['title'];
  tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
  value: string;
  onChange?: (event: unknown, value: string) => void;
  onReset?: IconButtonProps['onClick'];
  onError?: (error: string) => void;
};

const WrappedDateInput = ({
  defaultDateOffset = null,
  disabled,
  endAdornment = null,
  error = () => null,
  errorProps = null,
  helperText = null,
  helperTextProps = null,
  id: idProp = null,
  label,
  labelProps,
  loading = false,
  maxDateToday = false,
  minDateTomorrow = false,
  placeholder = null,
  preventDisabledColor = false,
  preventRender = false,
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
  ...textFieldProps
}: DateInputProps) => {
  const theme = useTheme();

  const [tempDate, setTempDate] = useState<Moment>(null);
  const [tomorrow, setTomorrow] = useState<Moment>(null);
  const [today, setToday] = useState<Moment>(null);
  const [focused, setFocused] = useState<boolean>(false);

  const id = useMemo<string>(() => (idProp || label).replaceAll(' ', '-'), [idProp, label]);

  const errorValue = useMemo<string>(
    () => error(tempDate && tempDate.isValid() ? `${tempDate.format('YYYY-MM-DDThh:mm:ss.SSSSSS')}Z` : null),
    [error, tempDate]
  );

  useEffect(() => {
    const tempTomorrow = new Date();
    tempTomorrow.setDate(tempTomorrow.getDate() + 1);
    tempTomorrow.setHours(0, 0, 0, 0);
    setTomorrow(moment(tempTomorrow));

    const tempToday = new Date();
    tempToday.setDate(tempToday.getDate() + 1);
    tempToday.setHours(0, 0, 0, 0);
    setToday(moment(tempToday));
  }, []);

  useEffect(() => {
    if (value === null && defaultDateOffset) {
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + defaultDateOffset);
      defaultDate.setHours(0, 0, 0, 0);
      setTempDate(moment(defaultDate));
    } else if (value) {
      setTempDate(moment(value));
    } else if (value === undefined || value === null) {
      setTempDate(null);
    }
  }, [defaultDateOffset, value]);

  return preventRender ? null : (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <div style={{ textAlign: 'left' }}>
        <Tooltip title={tooltip} {...tooltipProps}>
          <Typography
            component={InputLabel}
            htmlFor={id}
            color={!disabled && errorValue ? 'error' : focused ? 'primary' : 'textSecondary'}
            variant="body2"
            whiteSpace="nowrap"
            gutterBottom
            sx={{
              ...(disabled &&
                !preventDisabledColor && {
                  WebkitTextFillColor:
                    theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.38)'
                })
            }}
            {...labelProps}
            children={label}
          />
        </Tooltip>
        <FormControl fullWidth>
          {loading ? (
            <Skeleton sx={{ height: '40px', transform: 'unset', ...(tiny && { height: '28px' }) }} />
          ) : (
            <MuiDatePicker
              value={tempDate}
              readOnly={readOnly}
              minDate={minDateTomorrow ? tomorrow : null}
              maxDate={maxDateToday ? today : null}
              disabled={disabled}
              onChange={newValue => {
                setTempDate(newValue);

                const parsedValue =
                  newValue && newValue.isValid() ? `${newValue.format('YYYY-MM-DDThh:mm:ss.SSSSSS')}Z` : null;

                onChange(null, parsedValue);

                const err = error(parsedValue);
                if (err) onError(err);
              }}
              slotProps={{
                textField: {
                  id: id,
                  size: 'small',
                  error: !!errorValue && !disabled,
                  disabled: disabled,
                  helperText: disabled ? null : errorValue || helperText,
                  FormHelperTextProps: disabled
                    ? null
                    : errorValue
                      ? {
                          variant: 'outlined',
                          sx: { color: theme.palette.error.main, ...errorProps?.sx },
                          ...errorProps
                        }
                      : helperText
                        ? {
                            variant: 'outlined',
                            sx: { color: theme.palette.text.secondary, ...helperTextProps?.sx },
                            ...errorProps
                          }
                        : null,
                  sx: {
                    '& .MuiInputBase-input': {
                      ...(tiny && { fontSize: '14px' }),
                      ...(readOnly && !disabled && { cursor: 'default' })
                    },
                    '& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline': {
                      ...(readOnly &&
                        !disabled && {
                          borderColor:
                            theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)'
                        })
                    }
                  },
                  ...(readOnly && !disabled && { focused: null }),
                  ...textFieldProps,
                  onFocus: event => setFocused(document.activeElement === event.target),
                  onBlur: () => setFocused(false),
                  inputProps: {
                    ...(tiny && { sx: { padding: '2.5px 4px 2.5px 8px' } })
                  },
                  InputProps: {
                    placeholder: placeholder,
                    endAdornment: (
                      <>
                        {loading || !reset || disabled || readOnly ? null : (
                          <InputAdornment
                            position="end"
                            sx={{ paddingLeft: theme.spacing(0.5), marginRight: theme.spacing(-0.5) }}
                          >
                            <ResetInput
                              id={id}
                              preventRender={loading || !reset || disabled || readOnly}
                              tiny={tiny}
                              onReset={onReset}
                              {...resetProps}
                            />
                          </InputAdornment>
                        )}
                      </>
                    )
                  }
                }
              }}
            />
          )}
        </FormControl>
      </div>
    </LocalizationProvider>
  );
};

export const DateInput = React.memo(WrappedDateInput);
