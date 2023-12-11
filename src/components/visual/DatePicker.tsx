import { Button, Dialog, DialogActions, IconButton, TextField, Tooltip } from '@mui/material';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';

import EventIcon from '@mui/icons-material/Event';
import { DatePicker as MuiDatePicker, LocalizationProvider, StaticDatePicker } from '@mui/x-date-pickers';
import { useEffectOnce } from 'commons/components/utils/hooks/useEffectOnce';
import moment from 'moment';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface DatePickerProps {
  date: string;
  setDate: (date: string) => void;
  tooltip?: string;
  type?: 'button' | 'input';
  defaultDateOffset?: number | null;
}

function WrappedDatePicker({
  date,
  setDate,
  tooltip = null,
  type = 'button',
  defaultDateOffset = null
}: DatePickerProps) {
  const [tempDate, setTempDate] = React.useState(null);
  const [tomorrow, setTomorrow] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const { t } = useTranslation();

  useEffectOnce(() => {
    const temp = new Date();
    temp.setDate(temp.getDate() + 1);
    temp.setHours(0, 0, 0, 0);
    setTomorrow(moment(temp));
  });

  useEffect(() => {
    if (date === null && defaultDateOffset) {
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + defaultDateOffset);
      defaultDate.setHours(0, 0, 0, 0);
      setTempDate(moment(defaultDate));
    } else {
      setTempDate(moment(date));
    }
  }, [date, defaultDateOffset]);

  // Build chip based on computed values
  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      {type === 'button' ? (
        <>
          <Tooltip title={tooltip ? tooltip : t('date.open')}>
            <IconButton onClick={handleOpen}>
              <EventIcon />
            </IconButton>
          </Tooltip>
          <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <StaticDatePicker
              displayStaticWrapperAs="desktop"
              value={tempDate}
              onChange={newValue => {
                setTempDate(newValue);
              }}
              renderInput={params => <TextField {...params} />}
              minDate={tomorrow}
            />

            <DialogActions>
              <Button
                onClick={() => {
                  setDate(null);
                  handleClose();
                }}
                color="secondary"
              >
                {t('date.clear')}
              </Button>
              <Button
                onClick={() => {
                  setDate(tempDate.isValid() ? `${tempDate.format('YYYY-MM-DDThh:mm:ss.SSSSSS')}Z` : null);
                  handleClose();
                }}
                color="primary"
                autoFocus
                disabled={tempDate === null}
              >
                {t('date.select')}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      ) : (
        <MuiDatePicker
          value={tempDate}
          onChange={newValue => {
            setTempDate(newValue);
            setDate(newValue && newValue.isValid() ? `${newValue.format('YYYY-MM-DDThh:mm:ss.SSSSSS')}Z` : null);
          }}
          // renderInput={params => <TextField {...params} />}
          renderInput={({ inputRef, inputProps, InputProps }) => (
            <TextField
              size="small"
              label={tooltip ? tooltip : null}
              ref={inputRef}
              inputProps={{ ...inputProps }}
              InputProps={{ ...InputProps }}
            />
          )}
          minDate={tomorrow}
        />
      )}
    </LocalizationProvider>
  );
}

const DatePicker = React.memo(WrappedDatePicker);
export default DatePicker;
