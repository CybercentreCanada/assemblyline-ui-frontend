import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';
import type { ButtonProps } from '@mui/material';
import {
  Button,
  InputAdornment,
  MenuItem,
  Popover,
  Select,
  styled,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import { DigitalClock, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { DateTimePicker as MuiDateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { add, format, isValid, sub } from 'date-fns';
import type { Moment } from 'moment';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const StyledDigitalClock = styled(DigitalClock)(({ theme }) => ({
  maxHeight: '300px',
  '& .MuiDigitalClock-item': {
    fontSize: '12px'
  }
}));

const CommonlyUsedButton = styled(({ ...props }: ButtonProps) => <Button fullWidth size="small" {...props} />)(
  ({ theme }) => ({
    textTransform: 'inherit',
    justifyContent: 'start'
  })
);

type QuickSelectMenuProps = {
  onChange?: (event: unknown, value: unknown) => void;
};

const QuickSelectMenu = ({ onChange = () => null }: QuickSelectMenuProps) => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const open = useMemo<boolean>(() => Boolean(anchorEl), [anchorEl]);

  return (
    <>
      <Button
        color="inherit"
        variant="contained"
        onClick={event => setAnchorEl(event.currentTarget)}
        endIcon={
          <ExpandMoreOutlinedIcon
            sx={{
              transform: 'rotate(0deg)',
              transition: theme.transitions.create('transform', {
                easing: theme.transitions.easing.easeInOut,
                duration: theme.transitions.duration.shortest
              }),
              ...(open && { transform: 'rotate(180deg)' })
            }}
          />
        }
        sx={{ padding: `${theme.spacing(0.75)} ${theme.spacing(0.5)}` }}
      >
        <CalendarMonthOutlinedIcon />
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: -20, horizontal: 'center' }}
        transitionDuration={{
          appear: theme.transitions.duration.shortest,
          enter: theme.transitions.duration.shortest,
          exit: theme.transitions.duration.shortest
        }}
      >
        <div
          style={{
            padding: theme.spacing(2),
            display: 'flex',
            flexDirection: 'column',
            rowGap: theme.spacing(2),
            border: `1px solid ${theme.palette.divider}`
            // borderRadius: theme.shape.borderRadius
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              rowGap: theme.spacing(1)
            }}
          >
            <Typography color="textSecondary" variant="body2">
              Quick Select
            </Typography>
            <div style={{ display: 'flex', flexDirection: 'row', gap: theme.spacing(1) }}>
              <Select
                // disabled={disabled}
                // value={param.value}
                variant="outlined"
                size="small"
                // onChange={event => setParam(idx, pidx, event.target.value)}
                fullWidth
                MenuProps={{ sx: { '& .MuiPaper-root': { border: `1px solid ${theme.palette.divider}` } } }}
              >
                <MenuItem value="last">Last</MenuItem>
                <MenuItem value="next">Next</MenuItem>
              </Select>

              <TextField size="small" />

              <Select
                // disabled={disabled}
                // value={param.value}
                variant="outlined"
                size="small"
                // onChange={event => setParam(idx, pidx, event.target.value)}
                fullWidth
              >
                <MenuItem value="last">Last</MenuItem>
                <MenuItem value="next">Next</MenuItem>
              </Select>

              <Button size="small" variant="contained">
                Apply
              </Button>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              rowGap: theme.spacing(1)
            }}
          >
            <Typography color="textSecondary" variant="body2">
              Commonly Used
            </Typography>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing(0.25) }}>
              {QUICK_SELECT_OPTIONS.map(({ label, value: next }) => (
                <CommonlyUsedButton
                  key={label}
                  onClick={e => {
                    onChange(e, next);
                    setAnchorEl(null);
                  }}
                >
                  {t(label)}
                </CommonlyUsedButton>
              ))}
            </div>
          </div>
        </div>
      </Popover>
    </>
  );
};

type AbsoluteTabProps = {
  value: Moment;
  type: 'start' | 'end';
  onChange?: (value: Moment) => void;
};

const AbsoluteTab = ({ value, type, onChange = () => null }: AbsoluteTabProps) => {
  const theme = useTheme();

  console.log('test');

  return (
    <>
      <div
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'auto auto',
          gap: theme.spacing(0.25),
          alignItems: 'center'
        }}
      >
        <DateCalendar
          views={['month', 'day']}
          // timezone="utc"
          value={value}
          onChange={(next: Moment) => {
            // console.log(value, selectionState, selectedView);
            // console.log(new Date(value));

            // const parsedValue = next && next.isValid() ? `${next.format('YYYY-MM-DDThh:mm:ss.SSSSSS')}Z` : null;

            onChange(next);
          }}
        />
        <StyledDigitalClock
          value={value}
          // timezone="utc"
          onChange={next => {
            onChange(next);
          }}
        />
      </div>
      <MuiDateTimePicker
        value={value}
        disableOpenPicker
        // timezone="utc"
        slotProps={{
          textField: {
            size: 'small',
            fullWidth: true
          },
          inputAdornment: {
            children: (
              <InputAdornment position="start" disablePointerEvents>
                <FilterListIcon color="inherit" />
              </InputAdornment>
            )
          }
        }}
        // formatDensity="dense"
        // renderInput={params => (
        //   <TextField
        //     {...params}
        //     size="small" // This makes the TextField smaller
        //     fullWidth
        //   />
        // )}
        // TextFieldProps={{ size: 'small', fullWidth: true }}
        onChange={newValue => onChange(newValue)}
      />
    </>
  );
};

type RelativeTabProps = {
  value: Moment;
  type: 'start' | 'end';
  onChange?: (event: unknown, value: Moment) => void;
};

const RelativeTab = ({ value = null, type }: RelativeTabProps) => {
  const theme = useTheme();

  return (
    <div
      style={{
        margin: theme.spacing(2),
        display: 'flex',
        flexDirection: 'column',
        rowGap: theme.spacing(2)
      }}
    >
      relative
    </div>
  );
};

type NowTabProps = {
  value: Moment;
  type: 'start' | 'end';
  onChange?: (event: unknown, value: Moment) => void;
};

const NowTab = ({ value = null, type }: NowTabProps) => {
  const theme = useTheme();

  return (
    <div
      style={{
        margin: theme.spacing(2),
        display: 'flex',
        flexDirection: 'column',
        rowGap: theme.spacing(2)
      }}
    >
      now
    </div>
  );
};

type DateTimeInputProps = {
  value: Moment;
  type: 'start' | 'end';
  onChange?: (value: Moment) => void;
};

const DateTimeInput = ({ value = null, type, onChange = () => null }: DateTimeInputProps) => {
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [tab, setTab] = useState<'absolute' | 'relative' | 'now'>('absolute');

  const open = useMemo<boolean>(() => Boolean(anchorEl), [anchorEl]);

  console.log(value.toString());
  console.log(isValid(value.toString()));

  return (
    <>
      <Button
        color="inherit"
        onClick={event => setAnchorEl(event.currentTarget)}
        sx={{ textTransform: 'inherit', minWidth: 'inherit', fontWeight: 'inherit' }}
      >
        {format(value.toDate(), 'PPpp')}
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: -20, horizontal: 'center' }}
        transitionDuration={{
          appear: theme.transitions.duration.shortest,
          enter: theme.transitions.duration.shortest,
          exit: theme.transitions.duration.shortest
        }}
      >
        <Tabs
          value={tab}
          onChange={(e, t) => setTab(t)}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          centered
          slotProps={{ list: { sx: { justifyContent: 'center' } } }}
          sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
        >
          <Tab label="absolute" value="absolute" />
          <Tab label="relative" value="relative" />
          <Tab label="now" value="now" />
        </Tabs>

        <div
          style={{
            margin: theme.spacing(2),
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {(() => {
            switch (tab) {
              case 'absolute':
                return <AbsoluteTab value={value} type={type} onChange={onChange} />;
              case 'relative':
                return <RelativeTab value={value} type={type} onChange={onChange} />;
              case 'now':
                return <NowTab value={value} type={type} onChange={onChange} />;
            }
          })()}
        </div>
      </Popover>
    </>
  );
};

type DateTime = `[${string} TO ${string}]`;

const QUICK_SELECT_OPTIONS = [
  { label: 'today', value: '[now/d TO now/d]' },
  { label: 'last_24h', value: '[now-24h/h TO now]' },
  { label: 'this_week', value: '[now/w TO now/w]' },
  { label: 'last_7days', value: '[now-7d/d TO now]' },
  { label: 'last_15min', value: '[now-15m TO now]' },
  { label: 'last_30days', value: '[now-30d/d TO now]' },
  { label: 'last_30min', value: '[now-30m TO now]' },
  { label: 'last_90days', value: '[now-90d/d TO now]' },
  { label: 'last_1hour', value: '[now-1h TO now]' },
  { label: 'last_1year', value: '[now-1y/d TO now]' }
];

export type DateTimePickerProps = {
  value?: string;
  fullscreen?: boolean;
  onChange?: (event: unknown, value: string) => void;
};

export const DateTimePicker: React.FC<DateTimePickerProps> = React.memo(
  ({ value, fullscreen = false, onChange = () => null, ...props }: DateTimePickerProps) => {
    const { t, i18n } = useTranslation();
    const theme = useTheme();

    // const [from, setFrom] = useState<string>('');
    // const [to, setTo] = useState<string>('');

    const [quickSelectAnchor, setQuickSelectAnchor] = useState<HTMLButtonElement | null>(null);
    const [fromAnchor, setFromAnchor] = useState<HTMLButtonElement | null>(null);
    const [toAnchor, setToAnchor] = useState<HTMLButtonElement | null>(null);
    const [tab, setTab] = useState<'absolute' | 'relative' | 'now'>('absolute');

    const fromValue = useMemo<string>(() => (!!value && value.slice(1, -1).split(' TO ')?.[0]) || null, [value]);
    const toValue = useMemo<string>(() => (!!value && value.slice(1, -1).split(' TO ')?.[1]) || null, [value]);

    const fromDate = useMemo<Moment>(() => moment(value), [value]);
    const toDate = useMemo<Moment>(() => moment(value), [value]);

    const quickSelectOpen = useMemo<boolean>(() => Boolean(quickSelectAnchor), [quickSelectAnchor]);
    const fromOpen = useMemo<boolean>(() => Boolean(fromAnchor), [fromAnchor]);
    const toOpen = useMemo<boolean>(() => Boolean(toAnchor), [toAnchor]);

    function getRelativeDate(expression) {
      const now = new Date();

      const match = /now\s*([+-])\s*(\d+)\s*(days|months|years|hours|minutes|seconds)/i.exec(expression);

      if (!match) {
        throw new Error('Invalid date expression format');
      }

      const operator = match[1]; // "+" or "-"
      const value = parseInt(match[2], 10); // Number (e.g., 15)
      const unit = match[3].toLowerCase(); // Time unit (days, months, etc.)

      // Map the correct function based on the operator
      return operator === '+' ? add(now, { [unit]: value }) : sub(now, { [unit]: value });
    }

    useEffect(() => {}, []);

    // console.log(new Date(Date.now()).toUTCString());
    // console.log(getRelativeDate(new Date(Date.now()).toUTCString()));

    const [startDateTime, setStartDateTime] = useState(moment(Date.now()));

    return (
      <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale={i18n.language}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: theme.shape.borderRadius
          }}
        >
          <QuickSelectMenu />

          <DateTimeInput value={startDateTime} type="start" onChange={next => setStartDateTime(next)} />

          <Button
            color="inherit"
            disabled
            sx={{ textTransform: 'inherit', minWidth: 'inherit', paddingLeft: 0, paddingRight: 0 }}
          >
            <ArrowForwardIcon />
          </Button>

          <DateTimeInput value={moment(Date.now())} type="end" />
        </div>
      </LocalizationProvider>
    );
  }
);
