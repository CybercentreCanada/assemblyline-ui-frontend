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
import type { InputProps, InputValues } from 'components/visual/Inputs/lib/inputs.model';
import { PropProvider, usePropStore } from 'components/visual/Inputs/lib/inputs.provider';
import { isValidValue } from 'components/visual/Inputs/lib/inputs.utils';
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

const WrappedDateInput = () => {
  const theme = useTheme();
  const { i18n } = useTranslation('inputs');

  const [get, setStore] = usePropStore<DateInputProps>();

  const disabled = get(s => s.disabled);
  const endAdornment = get(s => s.endAdornment);
  const errorMsg = get(s => s.errorMsg);
  const id = get(s => s.id);
  const inputValue = get(s => s.inputValue);
  const loading = get(s => s.loading);
  const maxDateToday = get(s => s.maxDateToday);
  const minDateTomorrow = get(s => s.minDateTomorrow);
  const monospace = get(s => s.monospace);
  const placeholder = get(s => s.placeholder);
  const readOnly = get(s => s.readOnly);
  const tiny = get(s => s.tiny);

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
      setStore(s => {
        const err = s.error(newValue);
        s.onError(err);
        if (!err) s.onChange(event, newValue);
        return { ...s, inputValue: date, errorMsg: err };
      });
    },
    [setStore]
  );

  const handleFocus = useCallback(
    (event: React.FocusEvent) => {
      setStore(s => {
        s.onFocus(event);
        return {
          ...s,
          inputValue: moment(s.value),
          focused: !s.readOnly && !s.disabled && document.activeElement === event.target
        };
      });
    },
    [setStore]
  );

  const handleBlur = useCallback(
    (event: React.FocusEvent) => {
      setStore(s => {
        s.onBlur(event);
        return { ...s, focused: false, inputValue: null };
      });
    },
    [setStore]
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
                          <ResetInput onChange={handleChange} />
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
};

export const DateInput: React.FC<DateInputProps> = React.memo(
  ({
    defaultDateOffset = null,
    maxDateToday = false,
    minDateTomorrow = false,
    error = () => '',
    value,
    preventRender = false,
    ...props
  }) => {
    const { t } = useTranslation('inputs');

    const newError = useCallback(
      (val: string): string => {
        const err = error(val);
        if (err) return err;
        if (props.required && !isValidValue(val)) return t('error.required');
        return '';
      },
      [error, props.required, t]
    );

    return preventRender ? null : (
      <PropProvider<DateInputProps>
        data={{
          ...props,
          defaultDateOffset,
          maxDateToday,
          minDateTomorrow,
          error: newError,
          errorMsg: newError(value),
          value,
          inputValue: value ? moment(value) : null
        }}
      >
        <WrappedDateInput />
      </PropProvider>
    );
  }
);
