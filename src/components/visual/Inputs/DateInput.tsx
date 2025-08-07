import type { TextFieldProps } from '@mui/material';
import { useTheme } from '@mui/material';
import { LocalizationProvider, DatePicker as MuiDatePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import {
  ExpandInput,
  HelperText,
  PasswordInput,
  ResetInput,
  StyledEndAdornment,
  StyledFormControl,
  StyledFormLabel,
  StyledInputSkeleton,
  StyledRoot
} from 'components/visual/Inputs/lib/inputs.components';
import { useInputParsedProps } from 'components/visual/Inputs/lib/inputs.hook';
import type { InputProps, InputValues } from 'components/visual/Inputs/lib/inputs.model';
import { PropProvider, usePropStore } from 'components/visual/Inputs/lib/inputs.provider';
import type { Moment } from 'moment';
import moment from 'moment';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export type DateInputProps = Omit<TextFieldProps, 'error' | 'value' | 'onChange'> &
  InputValues<string, Moment> &
  InputProps & {
    defaultDateOffset?: number | null;
    maxDateToday?: boolean;
    minDateTomorrow?: boolean;
  };

const WrappedDateInput = React.memo(() => {
  const theme = useTheme();
  const { i18n } = useTranslation('inputs');

  const [get, setStore] = usePropStore<DateInputProps>();

  const disabled = get('disabled');
  const endAdornment = get('endAdornment');
  const errorMsg = get('errorMsg');
  const id = get('id');
  const inputValue = get('inputValue');
  const loading = get('loading');
  const maxDateToday = get('maxDateToday');
  const minDateTomorrow = get('minDateTomorrow');
  const monospace = get('monospace');
  const placeholder = get('placeholder');
  const readOnly = get('readOnly');
  const tiny = get('tiny');

  const error = get('error');
  const onBlur = get('onBlur');
  const onChange = get('onChange');
  const onError = get('onError');
  const onFocus = get('onFocus');

  const today = useMemo<Moment>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return moment(d);
  }, []);

  const tomorrow = useMemo<Moment>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
    return moment(d);
  }, []);

  const handleChange = useCallback(
    (event: React.SyntheticEvent, date: Moment) => {
      const newValue = date && date.isValid() ? `${date.format('YYYY-MM-DDThh:mm:ss.SSSSSS')}Z` : null;
      const err = error(newValue);
      onError(err);
      if (!err) onChange(event, newValue);
      setStore(() => ({ ...(!err && { value: newValue }), inputValue: date, errorMsg: err }));
    },
    [error, onChange, onError, setStore]
  );

  const handleFocus = useCallback(
    (event: React.FocusEvent) => {
      onFocus(event);
      setStore(s => ({
        // inputValue: s.value,
        focused: !s.readOnly && !s.disabled && document.activeElement === event.target
      }));
    },
    [onFocus, setStore]
  );

  const handleBlur = useCallback(
    (event: React.FocusEvent) => {
      onBlur(event);
      setStore(s => {
        const newInputValue = s.value ? moment(s.value) : null;
        const err = error(s.value);
        return { focused: false, inputValue: newInputValue, errorMsg: err };
      });
    },
    [error, onBlur, setStore]
  );

  return (
    <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale={i18n.language}>
      <StyledRoot>
        <StyledFormLabel />
        <StyledFormControl>
          {loading ? (
            <StyledInputSkeleton />
          ) : (
            <>
              <MuiDatePicker
                value={inputValue}
                readOnly={readOnly}
                minDate={minDateTomorrow ? tomorrow : null}
                maxDate={maxDateToday ? today : null}
                disabled={disabled}
                onChange={newValue => handleChange(null, newValue)}
                // slots={{ textField: props => <TextField {...props} /> }}
                slotProps={{
                  textField: {
                    id: id,
                    size: 'small',
                    error: !!errorMsg && !disabled,
                    disabled,
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
                    onFocus: handleFocus,
                    onBlur: handleBlur,
                    inputProps: {
                      ...(tiny && { sx: { padding: '2.5px 4px 2.5px 8px' } })
                    },
                    InputProps: {
                      placeholder: placeholder,
                      endAdornment: (
                        <StyledEndAdornment>
                          <PasswordInput />
                          <ResetInput />
                          <ExpandInput />
                          {endAdornment}
                        </StyledEndAdornment>
                      )
                    }
                  }
                }}
              />
              <HelperText />
            </>
          )}
        </StyledFormControl>
      </StyledRoot>
    </LocalizationProvider>
  );
});

export const DateInput = ({
  defaultDateOffset = null,
  maxDateToday = false,
  minDateTomorrow = false,
  value,
  preventRender = false,
  ...props
}: DateInputProps) => {
  const parsedProps = useInputParsedProps<string, Moment, DateInputProps>({
    ...props,
    defaultDateOffset,
    maxDateToday,
    minDateTomorrow,
    preventRender,
    value
  });

  return preventRender ? null : (
    <PropProvider<DateInputProps> props={{ ...parsedProps, inputValue: value ? moment(value) : null }}>
      <WrappedDateInput />
    </PropProvider>
  );
};
