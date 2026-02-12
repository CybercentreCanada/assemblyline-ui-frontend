import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import type { TextFieldProps } from '@mui/material';
import { Popover, useTheme } from '@mui/material';
import { DigitalClock, LocalizationProvider, DateTimePicker as MuiDateTimePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PropProvider, usePropStore } from 'components/core/PropProvider/PropProvider';
import { IconButton } from 'components/visual/Buttons/IconButton';
import {
  HelpInputAdornment,
  InputEndAdornment,
  PasswordInputAdornment,
  ProgressInputAdornment,
  ResetInputAdornment
} from 'components/visual/Inputs/components/inputs.component.adornment';
import {
  InputFormControl,
  InputFormLabel,
  InputHelperText,
  InputRoot,
  InputSkeleton
} from 'components/visual/Inputs/components/inputs.component.form';
import { useInputTextFieldSlots } from 'components/visual/Inputs/components/inputs.component.textfield';
import { useInputBlur, useInputChange, useInputFocus } from 'components/visual/Inputs/hooks/inputs.hook.event_handlers';
import { useInputId } from 'components/visual/Inputs/hooks/inputs.hook.renderer';
import { useInputValidation } from 'components/visual/Inputs/hooks/inputs.hook.validation';
import type {
  InputOptions,
  InputRuntimeState,
  InputSlotProps,
  InputValueModel
} from 'components/visual/Inputs/models/inputs.model';
import { DEFAULT_INPUT_CONTROLLER_PROPS } from 'components/visual/Inputs/models/inputs.model';
import type { Moment } from 'moment';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  InputValueModel<string> &
  InputOptions &
  InputSlotProps & {
    defaultDateOffset?: number | null;
    maxDateToday?: boolean;
    minDateTomorrow?: boolean;
  };

type DateInputController = DateInputProps &
  InputRuntimeState<Moment> & {
    showPopover?: boolean;
  };

const DatePopper = React.memo(() => {
  const { t } = useTranslation('inputs');
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState<Element>(null);

  const [get, setStore] = usePropStore<DateInputController>();

  const disabled = get('disabled');
  const id = useInputId();
  const rawValue = get('rawValue') ?? null;
  const showPopover = get('showPopover') ?? false;
  const tiny = get('tiny');

  const handleChange = useInputChange<string, Moment>();

  const toValue = useCallback((v: Moment): string => v.toISOString(), []);

  return (
    <>
      <IconButton
        id={`${id}-date-adornment`}
        color="secondary"
        disabled={disabled}
        tooltip={t('adornment.date.tooltip')}
        tooltipProps={{ arrow: true }}
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
              value={rawValue}
              onChange={(v: Moment) => handleChange(null, v, rawValue, toValue)}
              sx={{ height: '320px' }}
              slotProps={{ calendarHeader: { sx: { marginTop: '0px', marginBottom: '0px' } } }}
            />

            <DigitalClock
              // timezone="utc"
              value={rawValue}
              onChange={(v: Moment) => handleChange(null, v, rawValue, toValue)}
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

  const [get] = usePropStore<DateInputController>();

  const disabled = get('disabled');
  const endAdornment = get('endAdornment');
  const loading = get('loading');
  const maxDateToday = get('maxDateToday');
  const minDateTomorrow = get('minDateTomorrow');
  const rawValue = get('rawValue') ?? null;
  const readOnly = get('readOnly');
  const startAdornment = get('startAdornment');
  const value = get('value');

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

  const toRawValue = useCallback((v: string): Moment => (v ? moment(v) : null), []);
  const toValue = useCallback(
    (d: Moment): string => (d.isValid() ? `${d.format('YYYY-MM-DDThh:mm:ss.SSSSSS')}Z` : null),
    []
  );

  const handleBlur = useInputBlur<string, Moment>();
  const handleChange = useInputChange<string, Moment>();
  const handleFocus = useInputFocus<string, Moment>();

  const inputTextFieldSlots = useInputTextFieldSlots();

  useEffect(() => {
    configureMomentLocale(i18n.language);
  }, [i18n.language]);

  return (
    <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale={i18n.language}>
      <InputRoot>
        <InputFormLabel />
        <InputFormControl>
          {loading ? (
            <InputSkeleton />
          ) : (
            <>
              <MuiDateTimePicker
                disabled={disabled}
                disableOpenPicker
                format={i18n.language === 'fr' ? 'Do MMMM YYYY, H[h]mm' : 'MMMM D YYYY, h:mm a'}
                maxDate={maxDateToday ? today : null}
                minDate={minDateTomorrow ? tomorrow : null}
                readOnly={readOnly}
                value={rawValue}
                onChange={d => handleChange(null, d, rawValue, toValue)}
                slotProps={{
                  textField: {
                    ...inputTextFieldSlots,
                    onFocus: handleFocus,
                    onBlur: e => handleBlur(e, toRawValue(value), rawValue, toValue, toRawValue),
                    InputProps: {
                      ...(startAdornment && { startAdornment }),
                      endAdornment: (
                        <InputEndAdornment preventRender={false}>
                          {endAdornment}
                          <HelpInputAdornment />
                          <PasswordInputAdornment />
                          <ProgressInputAdornment />
                          <ResetInputAdornment />
                          <DatePopper />
                        </InputEndAdornment>
                      )
                    }
                  }
                }}
              />
              <InputHelperText />
            </>
          )}
        </InputFormControl>
      </InputRoot>
    </LocalizationProvider>
  );
};

export const DateInput = ({ preventRender = false, value, ...props }: DateInputProps) => {
  const { status: validationStatus, message: validationMessage } = useInputValidation<string, Moment>({
    value: value ?? '',
    ...props
  });

  return preventRender ? null : (
    <PropProvider<DateInputController>
      initialProps={{
        ...(DEFAULT_INPUT_CONTROLLER_PROPS as DateInputController),
        showPopover: false
      }}
      props={(prev, state) => ({
        autoComplete: 'off',
        defaultDateOffset: null,
        maxDateToday: false,
        minDateTomorrow: false,
        preventRender,
        rawValue: value === state?.value ? state?.rawValue : value ? moment(value) : null,
        validationMessage,
        validationStatus,
        value,
        ...props
      })}
    >
      <WrappedDateInput />
    </PropProvider>
  );
};
