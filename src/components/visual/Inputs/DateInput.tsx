import type { IconButtonProps, TextFieldProps, TooltipProps, TypographyProps } from '@mui/material';
import { FormControl, InputAdornment, InputLabel, Skeleton, TextField, Typography, useTheme } from '@mui/material';
import { LocalizationProvider, DatePicker as MuiDatePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { Tooltip } from 'components/visual/Tooltip';
import type { Moment } from 'moment';
import moment from 'moment';
import type { ReactNode } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import type { ResetInputProps } from './components/ResetInput';
import { ResetInput } from './components/ResetInput';

type Props = Omit<TextFieldProps, 'error' | 'value' | 'onChange'> & {
  defaultDateOffset?: number | null;
  endAdornment?: ReactNode;
  error?: (value: string) => string;
  id?: string;
  label?: string;
  labelProps?: TypographyProps;
  loading?: boolean;
  maxDateToday?: boolean;
  minDateTomorrow?: boolean;
  preventDisabledColor?: boolean;
  preventRender?: boolean;
  reset?: boolean;
  resetProps?: ResetInputProps;
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
  endAdornment,
  error = () => null,
  id = null,
  label,
  labelProps,
  loading = false,
  maxDateToday = false,
  minDateTomorrow = false,
  preventDisabledColor = false,
  preventRender = false,
  reset = false,
  resetProps = null,
  tooltip = null,
  tooltipProps = null,
  value,
  onChange = () => null,
  onReset = () => null,
  onError = () => null,
  ...textFieldProps
}: Props) => {
  const theme = useTheme();

  const [tempDate, setTempDate] = useState<Moment>(null);
  const [tomorrow, setTomorrow] = useState<Moment>(null);
  const [today, setToday] = useState<Moment>(null);

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
      <div>
        <Tooltip title={tooltip} {...tooltipProps}>
          <Typography
            component={InputLabel}
            htmlFor={id || label}
            color={!disabled && errorValue ? 'error' : 'textSecondary'}
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
            <Skeleton sx={{ height: '40px', transform: 'unset' }} />
          ) : (
            <MuiDatePicker
              value={tempDate}
              onChange={newValue => {
                setTempDate(newValue);

                const parsedValue =
                  newValue && newValue.isValid() ? `${newValue.format('YYYY-MM-DDThh:mm:ss.SSSSSS')}Z` : null;

                onChange(null, parsedValue);

                const err = error(parsedValue);
                if (err) onError(err);
              }}
              renderInput={({ inputRef, inputProps, InputProps }) => (
                <TextField
                  id={id || label}
                  size="small"
                  ref={inputRef}
                  error={!!errorValue && !disabled}
                  helperText={errorValue}
                  disabled={disabled}
                  {...textFieldProps}
                  inputProps={{ ...inputProps, ...textFieldProps?.inputProps }}
                  InputProps={{
                    ...InputProps,
                    ...textFieldProps?.InputProps,
                    endAdornment: (
                      <>
                        {InputProps?.endAdornment}
                        {!reset ? null : (
                          <InputAdornment
                            position="end"
                            sx={{ paddingLeft: theme.spacing(0.5), marginRight: theme.spacing(-0.5) }}
                          >
                            <ResetInput
                              id={id || label}
                              preventRender={!reset || disabled}
                              onReset={onReset}
                              {...resetProps}
                            />
                          </InputAdornment>
                        )}

                        {endAdornment && <InputAdornment position="end">{endAdornment}</InputAdornment>}
                      </>
                    )
                  }}
                />
              )}
              minDate={minDateTomorrow ? tomorrow : null}
              maxDate={maxDateToday ? today : null}
              disabled={disabled}
            />
          )}
        </FormControl>
      </div>
    </LocalizationProvider>
  );
};

export const DateInput = React.memo(WrappedDateInput);
