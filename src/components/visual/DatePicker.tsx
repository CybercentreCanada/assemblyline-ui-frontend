import { Button, Dialog, DialogActions, IconButton, TextField, Tooltip } from '@mui/material';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';

import EventIcon from '@mui/icons-material/Event';
import { LocalizationProvider, StaticDatePicker } from '@mui/x-date-pickers';
import moment from 'moment';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface DatePickerProps {
  date: string;
  setDate: (date: string) => void;
}

function WrappedDatePicker({ date, setDate }: DatePickerProps) {
  const [tempDate, setTempDate] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const { t } = useTranslation();

  useEffect(() => {
    setTempDate(date);
  }, [date]);

  // Build chip based on computed values
  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Tooltip title={t('date.open')}>
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
          value={moment(tempDate)}
          onChange={newValue => {
            setTempDate(newValue.format('YYYY-MM-DDThh:mm:ss.SSSSSSZ'));
          }}
          renderInput={params => <TextField {...params} />}
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
              setDate(tempDate);
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
    </LocalizationProvider>
  );
}

const DatePicker = React.memo(WrappedDatePicker);
export default DatePicker;
