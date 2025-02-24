import EventIcon from '@mui/icons-material/Event';
import type { TextFieldProps } from '@mui/material';
import { Button, Dialog, DialogActions, IconButton, TextField, Tooltip, useTheme } from '@mui/material';
import { LocalizationProvider, DatePicker as MuiDatePicker, StaticDatePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import type { Moment } from 'moment';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export type DatePickerProps = {
  date: string;
  setDate: (date: string) => void;
  tooltip?: string;
  type?: 'button' | 'input';
  defaultDateOffset?: number | null;
  textFieldProps?: TextFieldProps;
  minDateTomorrow?: boolean;
  maxDateToday?: boolean;
  disabled?: boolean;
};

function WrappedDatePicker({
  date,
  setDate,
  tooltip = null,
  type = 'button',
  defaultDateOffset = null,
  textFieldProps = null,
  minDateTomorrow = false,
  maxDateToday = false,
  disabled = false
}: DatePickerProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  const [tempDate, setTempDate] = useState<Moment>(null);
  const [tomorrow, setTomorrow] = useState<Moment>(null);
  const [today, setToday] = useState<Moment>(null);
  const [open, setOpen] = useState<boolean>(false);

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
    if (date === null && defaultDateOffset) {
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + defaultDateOffset);
      defaultDate.setHours(0, 0, 0, 0);
      setTempDate(moment(defaultDate));
    } else if (date) {
      setTempDate(moment(date));
    } else if (date === undefined || date === null) {
      setTempDate(null);
    }
  }, [date, defaultDateOffset]);

  // Build chip based on computed values
  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      {type === 'button' ? (
        <>
          <Tooltip title={tooltip ? tooltip : t('date.open')}>
            <IconButton onClick={() => setOpen(true)}>
              <EventIcon />
            </IconButton>
          </Tooltip>
          <Dialog open={open} onClose={() => setOpen(false)}>
            <StaticDatePicker
              displayStaticWrapperAs="desktop"
              value={tempDate}
              onChange={newValue => {
                setTempDate(newValue);
              }}
              renderInput={params => <TextField {...params} />}
              minDate={minDateTomorrow ? tomorrow : null}
              maxDate={maxDateToday ? today : null}
            />
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
              <Button
                style={{ margin: theme.spacing(1) }}
                onClick={() => {
                  setDate(null);
                  setOpen(false);
                }}
                color="secondary"
              >
                {t('date.clear')}
              </Button>
              <DialogActions>
                <Button color="secondary" onClick={() => setOpen(false)}>
                  {t('date.cancel')}
                </Button>
                <Button
                  color="primary"
                  autoFocus
                  disabled={tempDate === null}
                  onClick={() => {
                    setDate(tempDate.isValid() ? `${tempDate.format('YYYY-MM-DDThh:mm:ss.SSSSSS')}Z` : null);
                    setOpen(false);
                  }}
                >
                  {t('date.select')}
                </Button>
              </DialogActions>
            </div>
          </Dialog>
        </>
      ) : (
        <MuiDatePicker
          value={tempDate}
          onChange={newValue => {
            setTempDate(newValue);
            setDate(newValue && newValue.isValid() ? `${newValue.format('YYYY-MM-DDThh:mm:ss.SSSSSS')}Z` : null);
          }}
          renderInput={({ inputRef, inputProps, InputProps }) => (
            <TextField
              size="small"
              label={tooltip ? tooltip : null}
              ref={inputRef}
              {...textFieldProps}
              inputProps={{ ...inputProps, ...textFieldProps?.inputProps }}
              InputProps={{ ...InputProps, ...textFieldProps?.InputProps }}
            />
          )}
          minDate={minDateTomorrow ? tomorrow : null}
          maxDate={maxDateToday ? today : null}
          disabled={disabled}
        />
      )}
    </LocalizationProvider>
  );
}

const DatePicker = React.memo(WrappedDatePicker);
export default DatePicker;
