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
import type { DateTimeValues } from 'components/visual/DateTime/utils/datetime.utils';
import {
  isValidDateTimeRange,
  parseDateTimeString,
  QUICK_SELECT_OPTIONS,
  RELATIVE_DATETIME_OPTIONS
} from 'components/visual/DateTime/utils/datetime.utils';
import { NumberInput } from 'components/visual/Inputs/NumberInput';
import { SelectInput } from 'components/visual/Inputs/SelectInput';
import { SwitchInput } from 'components/visual/Inputs/SwitchInput';
import { format } from 'date-fns';
import type { Moment } from 'moment';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const StyledDigitalClock = styled(DigitalClock)(() => ({
  maxHeight: '300px',
  '& .MuiDigitalClock-item': {
    fontSize: '12px'
  }
}));

const CommonlyUsedButton = styled(({ ...props }: ButtonProps) => <Button fullWidth size="small" {...props} />)(() => ({
  textTransform: 'inherit',
  justifyContent: 'start'
}));

type DateTimeProps = {
  value?: DateTimeValues;
  variant?: 'start' | 'end';
  onChange?: (event: unknown, value: string) => void;
};

type QuickSelectMenuProps = {
  onChange: (event: unknown, value: string) => void;
};

const QuickSelectMenu = ({ onChange = () => null }: QuickSelectMenuProps) => {
  const { t } = useTranslation('dateTime');
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
              {QUICK_SELECT_OPTIONS.map(({ primary, value: next }) => (
                <CommonlyUsedButton
                  key={primary}
                  onClick={e => {
                    onChange(e, next);
                    setAnchorEl(null);
                  }}
                >
                  {t(primary)}
                </CommonlyUsedButton>
              ))}
            </div>
          </div>
        </div>
      </Popover>
    </>
  );
};

const AbsoluteTab = ({ value, variant = 'start', onChange = () => null }: DateTimeProps) => {
  const theme = useTheme();

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
          value={value.absolute}
          onChange={(v: Moment) => onChange(null, v.toISOString())}
        />
        <StyledDigitalClock
          value={value.absolute}
          // timezone="utc"
          onChange={v => onChange(null, v.toISOString())}
        />
      </div>
      <MuiDateTimePicker
        value={value.absolute}
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
        onChange={v => onChange(null, v.toISOString())}
      />
    </>
  );
};

const RelativeTab = ({ value = null, variant, onChange = () => null }: DateTimeProps) => {
  const theme = useTheme();

  // const absoluteDateTime = useMemo<Moment>(
  //   () =>
  //     moment(value).isValid()
  //       ? (value as Moment)
  //       : isValidRelativeDateTime(value)
  //         ? convertRelativeToAbsoluteDateTime(value)
  //         : null,
  //   [value]
  // );

  // const relativeDateTime = useMemo<RelativeDateTime>(
  //   () =>
  //     isValidRelativeDateTime(value)
  //       ? value
  //       : moment(value).isValid()
  //         ? convertAbsoluteToRelativeDateTime2(value)
  //         : null,

  //   [value]
  // );

  // const { sign, amount, timeSpan } = useMemo(() => splitRelativeDatetime(value.relative), [value?.relative]);

  // const { timeSpanAmount, relativeTimeSpan } = useMemo<RelativeDateTime>(
  //   () => convertAbsoluteToRelativeDateTime(value),
  //   [value]
  // );

  // console.log(timeSpanAmount, relativeTimeSpan);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: theme.spacing(1)
      }}
    >
      <NumberInput
        id="relative value"
        value={value.relative.amount}
        min={0}
        onChange={(e, v) => onChange(e, `now${value.relative.sign}${v}${value.relative.timeSpan}`)}
      />
      <SelectInput
        id="relative select"
        options={RELATIVE_DATETIME_OPTIONS.map(option => ({ primary: option.primary, value: option.value }))}
        value={`${value.relative.sign}${value.relative.timeSpan}`}
        onChange={(e, v) => onChange(e, `now${v[0]}${value.relative.amount}${v[1]}`)}
      />

      <div style={{ gridColumn: 'span 2' }}>
        <MuiDateTimePicker
          value={value.absolute}
          disableOpenPicker
          // timezone="utc"
          readOnly
          sx={{
            '& .MuiInputBase-input': {
              cursor: 'default'
            }
          }}
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
          onChange={v => onChange(null, v.toISOString())}
        />
      </div>

      <div style={{ gridColumn: 'span 2' }}>
        <SwitchInput label={''} value={false} />
      </div>
    </div>
  );
};

const NowTab = ({ value = null, variant, onChange = () => null }: DateTimeProps) => {
  const { t } = useTranslation('dateTime');
  const theme = useTheme();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(2) }}>
      <Button size="small" variant="contained" onClick={event => onChange(event, 'now')}>
        {t('set_now')}
      </Button>
    </div>
  );
};

type DateTimeInputProps = {
  value: DateTimeValues;
  variant: 'start' | 'end';
  onChange?: (event: unknown, value: string) => void;
};

const DateTimeInput = ({ value = null, variant, onChange = () => null }: DateTimeInputProps) => {
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [tab, setTab] = useState<'absolute' | 'relative' | 'now'>('absolute');

  const open = useMemo<boolean>(() => Boolean(anchorEl), [anchorEl]);

  console.log(value.relative.toLuceneString());

  return (
    <>
      <Button
        color="inherit"
        onClick={event => setAnchorEl(event.currentTarget)}
        sx={{ textTransform: 'inherit', minWidth: 'inherit', fontWeight: 'inherit' }}
      >
        {value.type === 'absolute'
          ? format(value.absolute.toDate(), 'PPpp')
          : value.type === 'relative'
            ? value.relative.toLuceneString()
            : null}
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
                return <AbsoluteTab value={value} variant={variant} onChange={onChange} />;
              case 'relative':
                return <RelativeTab value={value} variant={variant} onChange={onChange} />;
              case 'now':
                return <NowTab value={value} variant={variant} onChange={onChange} />;
            }
          })()}
        </div>
      </Popover>
    </>
  );
};

export type DateTimePickerProps = {
  value?: string;
  fullWidth?: boolean;
  onChange?: (event: unknown, value: string) => void;
};

export const DateTimePicker: React.FC<DateTimePickerProps> = React.memo(
  ({ value, fullWidth = false, onChange = () => null, ...props }: DateTimePickerProps) => {
    const { t, i18n } = useTranslation('dateTime');
    const theme = useTheme();

    const [fromStr, setFromStr] = useState<string>(null);
    const [toStr, setToStr] = useState<string>(null);

    const fromDateTime = useMemo<DateTimeValues>(() => parseDateTimeString(fromStr), [fromStr]);
    const toDateTime = useMemo<DateTimeValues>(() => parseDateTimeString(toStr), [toStr]);

    console.log(fromDateTime.absolute.toISOString(), fromDateTime.relative, fromDateTime.type);

    // const [from, setFrom] = useState<string>('');
    // const [to, setTo] = useState<string>('');

    // const [quickSelectAnchor, setQuickSelectAnchor] = useState<HTMLButtonElement | null>(null);
    // const [fromAnchor, setFromAnchor] = useState<HTMLButtonElement | null>(null);
    // const [toAnchor, setToAnchor] = useState<HTMLButtonElement | null>(null);
    // const [tab, setTab] = useState<'absolute' | 'relative' | 'now'>('absolute');

    // const fromValue = useMemo<string>(() => (!!value && value.slice(1, -1).split(' TO ')?.[0]) || null, [value]);
    // const toValue = useMemo<string>(() => (!!value && value.slice(1, -1).split(' TO ')?.[1]) || null, [value]);

    // const fromDate = useMemo<Moment>(() => moment(value), [value]);
    // const toDate = useMemo<Moment>(() => moment(value), [value]);

    // const quickSelectOpen = useMemo<boolean>(() => Boolean(quickSelectAnchor), [quickSelectAnchor]);
    // const fromOpen = useMemo<boolean>(() => Boolean(fromAnchor), [fromAnchor]);
    // const toOpen = useMemo<boolean>(() => Boolean(toAnchor), [toAnchor]);

    // function getRelativeDate(expression) {
    //   const now = new Date();

    //   const match = /now\s*([+-])\s*(\d+)\s*(days|months|years|hours|minutes|seconds)/i.exec(expression);

    //   if (!match) {
    //     throw new Error('Invalid date expression format');
    //   }

    //   const operator = match[1]; // "+" or "-"
    //   const value = parseInt(match[2], 10); // Number (e.g., 15)
    //   const unit = match[3].toLowerCase(); // Time unit (days, months, etc.)

    //   // Map the correct function based on the operator
    //   return operator === '+' ? add(now, { [unit]: value }) : sub(now, { [unit]: value });
    // }

    // useEffect(() => {}, []);

    // console.log(new Date(Date.now()).toUTCString());
    // console.log(getRelativeDate(new Date(Date.now()).toUTCString()));

    // const [startDateTime, setStartDateTime] = useState(moment(Date.now()));

    const applyChanges = useCallback(() => {}, []);

    console.log(value, fromStr, toStr);

    useEffect(() => {
      if (!value) return;
      const strippedValue = value.replaceAll(' ', '');
      if (!isValidDateTimeRange(strippedValue)) return;
      const parts = strippedValue.slice(1, -1).split('TO');
      setFromStr(parts?.[0] || null);
      setToStr(parts?.[1] || null);
    }, [value]);

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
          <QuickSelectMenu from={fromDateTime} to={toDateTime} onChange={onChange} />

          <DateTimeInput value={fromDateTime} variant="start" onChange={(e, v) => setFromStr(v)} />

          <Button
            color="inherit"
            disabled
            sx={{ textTransform: 'inherit', minWidth: 'inherit', paddingLeft: 0, paddingRight: 0 }}
          >
            <ArrowForwardIcon />
          </Button>

          <DateTimeInput value={toDateTime} variant="end" onChange={(e, v) => setFromStr(v)} />
        </div>
      </LocalizationProvider>
    );
  }
);
