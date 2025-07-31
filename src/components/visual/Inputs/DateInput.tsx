import type { TextFieldProps } from '@mui/material';
import { InputAdornment, useTheme } from '@mui/material';
import { LocalizationProvider, DatePicker as MuiDatePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import {
  HelperText,
  PasswordInput,
  ResetInput,
  StyledFormControl
} from 'components/visual/Inputs/lib/inputs.components';
import type { InputProps } from 'components/visual/Inputs/lib/inputs.model';
import type { Moment } from 'moment';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export type DateInputProps = Omit<TextFieldProps, 'error' | 'value' | 'onChange'> &
  InputProps<string> & {
    defaultDateOffset?: number | null;
    maxDateToday?: boolean;
    minDateTomorrow?: boolean;
  };

const WrappedDateInput = (props: DateInputProps) => {
  return null;

  const {
    defaultDateOffset = null,
    disabled,
    endAdornment = null,
    error = () => '',
    loading = false,
    maxDateToday = false,
    minDateTomorrow = false,
    monospace = false,
    placeholder = null,
    preventRender = false,
    readOnly = false,
    rootProps = null,
    tiny = false,
    value = '',
    onBlur = () => null,
    onChange = () => null,
    onError = () => null,
    onFocus = () => null
  } = props;

  const { i18n } = useTranslation();
  const theme = useTheme();

  const [tempDate, setTempDate] = useState<Moment>(null);
  const [tomorrow, setTomorrow] = useState<Moment>(null);
  const [today, setToday] = useState<Moment>(null);
  const [focused, setFocused] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(true);

  const errorValue = useMemo<string>(
    () => error(tempDate && tempDate.isValid() ? `${tempDate.format('YYYY-MM-DDThh:mm:ss.SSSSSS')}Z` : null),
    [error, tempDate]
  );

  const preventPasswordRender = usePreventPassword(props);
  const preventResetRender = usePreventReset(props);

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
    <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale={i18n.language}>
      <div {...rootProps} style={{ textAlign: 'left', ...rootProps?.style }}>
        <StyledFormLabel props={props} focused={focused} />
        <StyledFormControl props={props}>
          {loading ? (
            <StyledInputSkeleton props={props} />
          ) : (
            <>
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
                    id: getAriaLabel(props),
                    size: 'small',
                    error: !!errorValue && !disabled,
                    disabled: disabled,
                    ...(readOnly && !disabled && { focused: null }),
                    sx: {
                      '& .MuiInputBase-input': {
                        ...(tiny && { fontSize: '14px' }),
                        ...(readOnly && !disabled && { cursor: 'default' }),
                        ...(monospace && { fontFamily: 'monospace' })
                      },
                      '& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline': {
                        ...(readOnly &&
                          !disabled && {
                            borderColor:
                              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)'
                          })
                      }
                    },
                    onFocus: (event, ...other) => {
                      setFocused(!readOnly && !disabled && document.activeElement === event.target);
                      onFocus(event, ...other);
                    },
                    onBlur: (event, ...other) => {
                      setFocused(false);
                      onBlur(event, ...other);
                    },
                    inputProps: {
                      ...(tiny && { sx: { padding: '2.5px 4px 2.5px 8px' } })
                    },
                    InputProps: {
                      placeholder: placeholder,
                      endAdornment:
                        preventPasswordRender && preventResetRender && !endAdornment ? null : (
                          <InputAdornment position="end">
                            <PasswordInput
                              props={props}
                              showPassword={showPassword}
                              onShowPassword={() => setShowPassword(p => !p)}
                            />
                            <ResetInput props={props} />
                            {endAdornment}
                          </InputAdornment>
                        )
                    }
                  }
                }}
              />
              <HelperText props={props} />
            </>
          )}
        </StyledFormControl>
      </div>
    </LocalizationProvider>
  );
};

export const DateInput: React.FC<DateInputProps> = React.memo(WrappedDateInput);
