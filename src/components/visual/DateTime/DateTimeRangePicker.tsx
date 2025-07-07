import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';
import type { ButtonProps } from '@mui/material';
import {
  Button,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Popover,
  Select,
  styled,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import type { DateCalendarProps, DigitalClockProps } from '@mui/x-date-pickers';
import { DigitalClock, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import type { DateTimePickerProps } from '@mui/x-date-pickers/DateTimePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import type { DateTimeType, TimeSpan } from 'components/visual/DateTime/LuceneDateTime';
import { LuceneDateTime } from 'components/visual/DateTime/LuceneDateTime';
import { SwitchInput } from 'components/visual/Inputs/SwitchInput';
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

const StyledDigitalClock = styled(({ ...props }: DigitalClockProps<Moment>) => (
  <DigitalClock
    // timezone="utc"
    {...props}
  />
))(() => ({
  maxHeight: '300px',
  '& .MuiDigitalClock-item': {
    fontSize: '12px'
  }
}));

const StyledDateTimePicker = styled(({ readOnly = false, ...props }: DateTimePickerProps<Moment>) => {
  const { i18n } = useTranslation('dateTime');

  return (
    <DateTimePicker
      disableOpenPicker
      // timezone="utc"
      format={i18n.language === 'fr' ? 'Do MMMM YYYY, H[h]mm' : 'MMMM D YYYY, h:mm a'}
      readOnly={readOnly}
      slotProps={{
        textField: {
          size: 'small',
          fullWidth: true,
          ...(readOnly && { readOnly: true, select: false })
        },
        inputAdornment: {
          children: (
            <InputAdornment position="start" disablePointerEvents>
              <FilterListIcon color="inherit" />
            </InputAdornment>
          )
        }
      }}
      {...props}
    />
  );
})(({ theme, readOnly }) => ({
  '& .MuiInputBase-input': {
    ...(readOnly && { cursor: 'default' })
  },
  '& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline': {
    ...(readOnly && {
      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)'
    })
  }
}));

const StyledDateCalendar = styled(({ ...props }: DateCalendarProps<Moment>) => (
  <DateCalendar
    views={['month', 'day']}
    // timezone="utc"
    showDaysOutsideCurrentMonth
    {...props}
  />
))(() => ({}));

const CommonlyUsedButton = styled(({ ...props }: ButtonProps) => <Button fullWidth size="small" {...props} />)(() => ({
  textTransform: 'inherit',
  justifyContent: 'start'
}));

export const QUICK_SELECT_OPTIONS = [
  { primary: 'today', value: '[now/d TO now/d]' },
  { primary: 'last_24h', value: '[now-24h/h TO now]' },
  { primary: 'this_week', value: '[now/w TO now/w]' },
  { primary: 'last_7d', value: '[now-7d/d TO now]' },
  { primary: 'last_15m', value: '[now-15m TO now]' },
  { primary: 'last_30d', value: '[now-30d/d TO now]' },
  { primary: 'last_30m', value: '[now-30m TO now]' },
  { primary: 'last_90d', value: '[now-90d/d TO now]' },
  { primary: 'last_1h', value: '[now-1h TO now]' },
  { primary: 'last_1y', value: '[now-1y/d TO now]' }
] as const;

type QuickSelectMenuProps = {
  from: LuceneDateTime;
  to: LuceneDateTime;
  disabled?: boolean;
  onChange: (event: unknown, value: string) => void;
};

const QuickSelectMenu = ({ from = null, to = null, disabled = false, onChange = () => null }: QuickSelectMenuProps) => {
  const { t } = useTranslation('dateTime');
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [sign, setSign] = useState<'+' | '-'>('-');
  const [amount, setAmount] = useState<number>(0);
  const [timeSpan, setTimeSpan] = useState<TimeSpan>('s');

  const open = useMemo<boolean>(() => Boolean(anchorEl), [anchorEl]);

  useEffect(() => {
    if (from.relative === 'now') {
      setSign(to.sign);
      setAmount(to.amount);
      setTimeSpan(to.timeSpan);
    } else {
      setSign(from.sign);
      setAmount(from.amount);
      setTimeSpan(from.timeSpan);
    }
  }, [from, to]);

  return (
    <>
      <Button
        color="inherit"
        disabled={disabled}
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
        sx={{
          padding: `${theme.spacing(0.75)} ${theme.spacing(0.5)}`,
          minWidth: theme.spacing(6),
          '& .MuiButton-icon': {
            marginLeft: '0px'
          }
        }}
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
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              rowGap: theme.spacing(1)
            }}
          >
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                columnGap: theme.spacing(1)
              }}
            >
              <Typography color="textSecondary" variant="body2" sx={{ flex: 1 }}>
                {t('quick_select')}
              </Typography>

              <Tooltip title="previous_window">
                <IconButton
                  size="small"
                  onClick={() => {
                    const [start, end] = LuceneDateTime.previousTimeWindow(from, to);
                    onChange(null, `[${start} TO ${end}]`);
                  }}
                >
                  <ArrowBackIosNewOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="next_window">
                <IconButton
                  size="small"
                  onClick={() => {
                    const [start, end] = LuceneDateTime.nextTimeWindow(from, to);
                    onChange(null, `[${start} TO ${end}]`);
                  }}
                >
                  <ArrowForwardIosOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </div>

            <div
              style={{
                width: 'auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                alignItems: 'end',
                gap: theme.spacing(1)
              }}
            >
              <Select
                id="sign-input"
                size="small"
                value={sign}
                defaultValue={'-'}
                onChange={e => setSign(e.target.value as '-' | '+')}
              >
                <MenuItem value="-">{t('last')}</MenuItem>
                <MenuItem value="+">{t('next')}</MenuItem>
              </Select>

              <TextField
                id="amount-input"
                size="small"
                type="number"
                variant="outlined"
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                slotProps={{ input: { inputProps: { min: 0 } } }}
                sx={{ width: '140px' }}
              />

              <Select
                id="timeSpan-input"
                size="small"
                value={timeSpan}
                defaultValue={'h'}
                onChange={e => setTimeSpan(e.target.value as TimeSpan)}
              >
                <MenuItem value="s">{t('.s')}</MenuItem>
                <MenuItem value="m">{t('.m')}</MenuItem>
                <MenuItem value="h">{t('.h')}</MenuItem>
                <MenuItem value="d">{t('.d')}</MenuItem>
                <MenuItem value="w">{t('.w')}</MenuItem>
                <MenuItem value="M">{t('.M')}</MenuItem>
                <MenuItem value="y">{t('.y')}</MenuItem>
              </Select>

              <Button
                size="small"
                variant="contained"
                onClick={e => {
                  onChange(
                    e,
                    sign === '+' ? `[now TO now${sign}${amount}${timeSpan}]` : `[now${sign}${amount}${timeSpan} TO now]`
                  );
                  setAnchorEl(null);
                }}
                sx={{ height: '40px' }}
              >
                {t('apply')}
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
              {t('commonly_used')}
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

type DateTimeProps = {
  value?: LuceneDateTime;
  variant?: 'start' | 'end';
  onChange?: (event: unknown, value: string) => void;
  onApply?: () => void;
};

const AbsoluteTab = ({ value, variant = 'start', onChange = () => null }: DateTimeProps) => {
  const { t } = useTranslation('dateTime');
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
        <StyledDateCalendar value={value.absolute} onChange={(v: Moment) => onChange(null, v.toISOString())} />
        <StyledDigitalClock value={value.absolute} onChange={(v: Moment) => onChange(null, v.toISOString())} />
      </div>
      <div>
        <Typography
          component={InputLabel}
          variant="body2"
          whiteSpace="nowrap"
          gutterBottom
          children={variant === 'start' ? t('start_date') : t('end_date')}
        />
        <StyledDateTimePicker value={value.absolute} onChange={v => onChange(null, v.toISOString())} />
      </div>
    </>
  );
};

export const RELATIVE_DATETIME_OPTIONS = [
  { primary: 'seconds_ago', value: '-s' },
  { primary: 'minutes_ago', value: '-m' },
  { primary: 'hours_ago', value: '-h' },
  { primary: 'days_ago', value: '-d' },
  { primary: 'weeks_ago', value: '-w' },
  { primary: 'months_ago', value: '-M' },
  { primary: 'years_ago', value: '-y' },

  { primary: 'seconds_from_now', value: '+s' },
  { primary: 'minutes_from_now', value: '+m' },
  { primary: 'hours_from_now', value: '+h' },
  { primary: 'days_from_now', value: '+d' },
  { primary: 'weeks_from_now', value: '+w' },
  { primary: 'months_from_now', value: '+M' },
  { primary: 'years_from_now', value: '+y' }
] as const;

const RelativeTab = ({ value = null, variant, onChange = () => null }: DateTimeProps) => {
  const { t } = useTranslation('dateTime');
  const theme = useTheme();

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: theme.spacing(1)
      }}
    >
      <TextField
        id="relative-amount-input"
        size="small"
        type="number"
        variant="outlined"
        value={value.amount}
        onChange={e => {
          value.amount = Number(e.target.value);
          onChange(e, value.toStringifiedParts());
        }}
        slotProps={{ input: { inputProps: { min: 0 } } }}
      />

      <Select
        id="relative-datetime-select"
        size="small"
        value={`${value.sign}${value.timeSpan}`}
        defaultValue={`-h`}
        onChange={e => {
          value.sign = (e.target.value?.[0] as '+' | '-') || '-';
          value.timeSpan = (e.target.value?.[1] as TimeSpan) || 'h';
          onChange(e, value.toStringifiedParts());
        }}
      >
        {RELATIVE_DATETIME_OPTIONS.map((option, i) => (
          <MenuItem key={`${option.value}-${i}`} value={option.value}>
            {t(option.value)}
          </MenuItem>
        ))}
      </Select>

      <div style={{ gridColumn: 'span 2' }}>
        <Typography
          component={InputLabel}
          variant="body2"
          whiteSpace="nowrap"
          gutterBottom
          children={variant === 'start' ? t('start_date') : t('end_date')}
        />
        <StyledDateTimePicker value={value.absolute} readOnly />
      </div>

      <div style={{ gridColumn: 'span 2' }}>
        <SwitchInput
          label={t(`/${value.timeSpan}`)}
          value={!!value.rounded && value.timeSpan === value.rounded}
          onChange={(e, v) => {
            value.rounded = v ? value.timeSpan : null;
            onChange(e, value.toStringifiedParts());
          }}
        />
      </div>
    </div>
  );
};

const NowTab = ({ variant = null, onChange = () => null }: DateTimeProps) => {
  const { t } = useTranslation('dateTime');
  const theme = useTheme();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(2) }}>
      <Button
        size="small"
        variant="contained"
        onClick={event => onChange(event, 'now')}
        sx={{ textTransform: 'inherit' }}
      >
        {variant === 'end' ? t('set_end_now') : t('set_start_now')}
      </Button>
    </div>
  );
};

type DateTimeInputProps = {
  value: LuceneDateTime;
  variant: 'start' | 'end';
  disabled?: boolean;
  fullWidth?: boolean;

  onChange?: (event: unknown, value: string) => void;
  onApply?: () => void;
};

const DateTimeInput = ({
  value = null,
  variant,
  disabled = false,
  fullWidth = false,
  onChange = () => null,
  onApply = () => null
}: DateTimeInputProps) => {
  const theme = useTheme();
  const { i18n } = useTranslation('dateTime');

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [tab, setTab] = useState<'absolute' | 'relative' | 'now'>(value.type);

  const open = useMemo<boolean>(() => Boolean(anchorEl), [anchorEl]);

  useEffect(() => {
    setTab(value.type);
  }, [value.type]);

  return (
    <>
      <Button
        color="inherit"
        disabled={disabled}
        onClick={event => setAnchorEl(event.currentTarget)}
        sx={{
          display: 'block',
          textTransform: 'inherit',
          minWidth: 'inherit',
          fontWeight: 'inherit',
          width: fullWidth ? '100%' : 'auto',
          paddingLeft: theme.spacing(0.5),
          paddingRight: theme.spacing(0.5),
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {value.toString({ language: i18n.language })}
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => {
          setAnchorEl(null);
          onApply();
        }}
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
          onChange={(e, t: DateTimeType) => setTab(t)}
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

export type DateTimeRangePickerProps = {
  value?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  onChange?: (event: unknown, value: string) => void;
};

export const DateTimeRangePicker: React.FC<DateTimeRangePickerProps> = React.memo(
  ({ value, disabled = false, fullWidth = false, onChange = () => null }: DateTimeRangePickerProps) => {
    const { t, i18n } = useTranslation('dateTime');
    const theme = useTheme();

    const [fromStr, toStr] = useMemo<[string, string]>(() => {
      // Check if the value matches the format: [${string}TO${string}]
      if (!/^\[.+?TO.+?\]$/.test(value)) return [null, null];

      return (value.slice(1, -1).split(' TO ') as [string, string]) || [null, null];
    }, [value]);

    const [from, setFrom] = useState<LuceneDateTime>(new LuceneDateTime(fromStr, 'start'));
    const [to, setTo] = useState<LuceneDateTime>(new LuceneDateTime(fromStr, 'end'));
    const [error, setError] = useState<string>(null);

    const validateDateTimeRange = useCallback(
      (earlier: LuceneDateTime, later: LuceneDateTime): boolean => later.toValue() - earlier.toValue() >= 1000,
      []
    );

    const applyChanges = useCallback(() => {
      if (!validateDateTimeRange(from, to)) {
        setError('error');
      } else {
        onChange(null, `[${from.toLucene()} TO ${to.toLucene()}]`);
        setError(null);
      }
    }, [from, onChange, to, validateDateTimeRange]);

    useEffect(() => {
      setFrom(new LuceneDateTime(fromStr, 'start'));
      setTo(new LuceneDateTime(toStr, 'end'));
    }, [fromStr, toStr]);

    useEffect(() => {
      configureMomentLocale(i18n.language);
    }, [i18n.language]);

    return (
      <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale={i18n.language}>
        <div>
          <div
            style={{
              position: 'relative',
              width: fullWidth ? '100%' : 'fit-content',
              minHeight: '40px',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '5px',
              ...(error && { border: `1px solid ${theme.palette.error.main}` })
            }}
          >
            <QuickSelectMenu
              from={from}
              to={to}
              disabled={disabled}
              onChange={(e, v) => {
                setError(null);
                onChange(e, v);
              }}
            />

            <DateTimeInput
              value={from}
              variant="start"
              disabled={disabled}
              fullWidth={fullWidth}
              onChange={(e, v) => setFrom(() => new LuceneDateTime(v))}
              onApply={() => applyChanges()}
            />

            <Button
              color="inherit"
              disabled
              size="small"
              sx={{ textTransform: 'inherit', minWidth: 'inherit', paddingLeft: 0, paddingRight: 0 }}
            >
              <ArrowForwardIcon fontSize="small" />
            </Button>

            <DateTimeInput
              value={to}
              variant="end"
              disabled={disabled}
              fullWidth={fullWidth}
              onChange={(e, v) => setTo(() => new LuceneDateTime(v))}
              onApply={() => applyChanges()}
            />
          </div>
          {error && (
            <FormHelperText variant="outlined" sx={{ color: theme.palette.error.main }}>
              {t(error)}
            </FormHelperText>
          )}
        </div>
      </LocalizationProvider>
    );
  }
);
