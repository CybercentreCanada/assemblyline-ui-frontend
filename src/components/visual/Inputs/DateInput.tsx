import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import type { TextFieldProps } from '@mui/material';
import { Popover, useTheme } from '@mui/material';
import { DigitalClock, LocalizationProvider, DateTimePicker as MuiDateTimePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { IconButton } from 'components/visual/Buttons/IconButton';
import {
  ExpandAdornment,
  HelperText,
  PasswordAdornment,
  ResetAdornment,
  StyledEndAdornment,
  StyledFormControl,
  StyledFormLabel,
  StyledInputSkeleton,
  StyledRoot,
  useTextInputSlot
} from 'components/visual/Inputs/lib/inputs.components';
import { useInputBlur, useInputChange, useInputFocus, usePropID } from 'components/visual/Inputs/lib/inputs.hook';
import type { InputProps, InputValues } from 'components/visual/Inputs/lib/inputs.model';
import { PropProvider, usePropStore } from 'components/visual/Inputs/lib/inputs.provider';
import type { Moment } from 'moment';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

// This function updates the week start for the specified locale
function configureMomentLocale(language: string) {
  moment.updateLocale(language, {
    week: {
      dow: 0 // Week starts on Sunday (0 = Sunday, 1 = Monday, etc.)
    }
  });
}

export type DateInputProps = Omit<TextFieldProps, 'error' | 'value' | 'onChange'> &
  InputValues<string, Moment> &
  InputProps & {
    defaultDateOffset?: number | null;
    maxDateToday?: boolean;
    minDateTomorrow?: boolean;
  };

type DateInputState = DateInputProps & {
  showPopover: boolean;
};

const DatePopper = React.memo(() => {
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState<Element>(null);

  const [get, setStore] = usePropStore<DateInputState>();

  const id = usePropID();
  const inputValue = get('inputValue') ?? null;
  const showPopover = get('showPopover') ?? false;
  const tiny = get('tiny');

  const handleChange = useInputChange<DateInputProps>();

  return (
    <>
      <IconButton
        aria-label={`${id}-date`}
        color="secondary"
        type="button"
        onClick={event => {
          event.preventDefault();
          event.stopPropagation();
          setStore(() => ({ showPopover: true }));
          setAnchorEl(event.currentTarget);
        }}
        sx={{
          padding: tiny ? theme.spacing(0.25) : theme.spacing(0.5)
        }}
      >
        <CalendarMonthOutlinedIcon fontSize="small" />
      </IconButton>
      {anchorEl && (
        <Popover
          open={showPopover}
          anchorEl={anchorEl}
          onClose={() => setStore(() => ({ showPopover: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: -20, horizontal: 'center' }}
          transitionDuration={{
            appear: theme.transitions.duration.shortest,
            enter: theme.transitions.duration.shortest,
            exit: theme.transitions.duration.shortest
          }}
          slotProps={{
            transition: {
              onExited: () => setAnchorEl(null)
            },
            paper: {
              sx: {
                width: '500px',
                border: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                flexDirection: 'column'
              }
            }
          }}
        >
          <div
            style={{
              width: '100%',
              padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
              display: 'grid',
              gridTemplateColumns: 'auto auto',
              justifyContent: 'content',
              gap: theme.spacing(0.25)
            }}
          >
            <DateCalendar
              views={['month', 'day']}
              // timezone="utc"
              showDaysOutsideCurrentMonth
              value={inputValue}
              onChange={(v: Moment) => handleChange(null, v, v.toISOString())}
              sx={{ height: '320px' }}
              slotProps={{ calendarHeader: { sx: { marginTop: '0px', marginBottom: '0px' } } }}
            />

            <DigitalClock
              // timezone="utc"
              value={inputValue}
              onChange={(v: Moment) => handleChange(null, v, v.toISOString())}
              sx={{
                maxHeight: '320px',
                '& .MuiDigitalClock-item': {
                  fontSize: '12px'
                }
              }}
            />
          </div>
        </Popover>
      )}
    </>
  );
});

const WrappedDateInput = () => {
  const { i18n } = useTranslation('inputs');

  const [get] = usePropStore<DateInputState>();

  const disabled = get('disabled');
  const endAdornment = get('endAdornment');
  const inputValue = get('inputValue') ?? null;
  const loading = get('loading');
  const maxDateToday = get('maxDateToday');
  const minDateTomorrow = get('minDateTomorrow');
  const readOnly = get('readOnly');

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

  const handleBlur = useInputBlur<DateInputProps>();
  const handleChange = useInputChange<DateInputProps>();
  const handleFocus = useInputFocus<DateInputProps>();

  const textfieldSlot = useTextInputSlot();

  useEffect(() => {
    configureMomentLocale(i18n.language);
  }, [i18n.language]);

  return (
    <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale={i18n.language}>
      <StyledRoot>
        <StyledFormLabel />
        <StyledFormControl>
          {loading ? (
            <StyledInputSkeleton />
          ) : (
            <>
              <MuiDateTimePicker
                disabled={disabled}
                disableOpenPicker
                format={i18n.language === 'fr' ? 'Do MMMM YYYY, H[h]mm' : 'MMMM D YYYY, h:mm a'}
                maxDate={maxDateToday ? today : null}
                minDate={minDateTomorrow ? tomorrow : null}
                readOnly={readOnly}
                value={inputValue}
                onChange={d =>
                  handleChange(null, d, d && d.isValid() ? `${d.format('YYYY-MM-DDThh:mm:ss.SSSSSS')}Z` : null)
                }
                slotProps={{
                  textField: {
                    ...textfieldSlot,
                    onFocus: handleFocus,
                    onBlur: e => handleBlur(e),
                    InputProps: {
                      endAdornment: (
                        <StyledEndAdornment preventRender={disabled || readOnly}>
                          <PasswordAdornment />
                          <ResetAdornment />
                          <ExpandAdornment />
                          {endAdornment}
                          <DatePopper />
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

export const DateInput = ({ value, preventRender = false, ...props }: DateInputProps) =>
  preventRender ? null : (
    <PropProvider<DateInputProps>
      props={{
        autoComplete: 'off',
        defaultDateOffset: null,
        inputValue: value ? moment(value) : null,
        maxDateToday: false,
        minDateTomorrow: false,
        preventRender,
        value,
        ...props
      }}
    >
      <WrappedDateInput />
    </PropProvider>
  );
