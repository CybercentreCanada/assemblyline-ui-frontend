import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import UpdateOutlinedIcon from '@mui/icons-material/UpdateOutlined';
import type { ButtonProps } from '@mui/material';
import {
  Button,
  Divider,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Popover,
  Select,
  styled,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
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
import type { TimeSpan } from 'components/visual/DateTime/LuceneDateTime';
import { LuceneDateTime, LuceneDateTimeGap, TIME_SPAN } from 'components/visual/DateTime/LuceneDateTime';
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
  maxHeight: '320px',
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
    sx={{ height: '320px' }}
    slotProps={{ calendarHeader: { sx: { marginTop: '0px', marginBottom: '0px' } } }}
    {...props}
  />
))(() => ({}));

const CommonlyUsedButton = styled(({ ...props }: ButtonProps) => <Button fullWidth size="small" {...props} />)(() => ({
  textTransform: 'inherit',
  justifyContent: 'start'
}));

export const QUICK_SELECT_OPTIONS = [
  { primary: 'today', value: { start: 'now/d', end: 'now/d', gap: '1h' } },
  { primary: 'last_24h', value: { start: 'now-24h/h', end: 'now', gap: '1h' } },
  { primary: 'this_week', value: { start: 'now/w', end: 'now/w', gap: '1d' } },
  { primary: 'last_7d', value: { start: 'now-7d/d', end: 'now', gap: '1d' } },
  { primary: 'last_15m', value: { start: 'now-15m', end: 'now', gap: '1m' } },
  { primary: 'last_30d', value: { start: 'now-30d/d', end: 'now', gap: '1d' } },
  { primary: 'last_30m', value: { start: 'now-30m', end: 'now', gap: '1m' } },
  { primary: 'last_90d', value: { start: 'now-90d/d', end: 'now', gap: '7d' } },
  { primary: 'last_1h', value: { start: 'now-1h', end: 'now', gap: '1m' } },
  { primary: 'last_1y', value: { start: 'now-1y/d', end: 'now', gap: '30d' } }
] as const;

type QuickSelectMenuProps = {
  start: LuceneDateTime;
  end: LuceneDateTime;
  gap: LuceneDateTimeGap;
  disabled: boolean;
  onChange: (event: unknown, values: { start: string; end: string; gap: string }) => void;
};

const QuickSelectMenu = ({
  start = null,
  end = null,
  gap = null,
  disabled = false,
  onChange = () => null
}: QuickSelectMenuProps) => {
  const { t } = useTranslation('dateTime');
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [sign, setSign] = useState<'+' | '-'>('-');
  const [amount, setAmount] = useState<number>(0);
  const [timeSpan, setTimeSpan] = useState<TimeSpan>('s');

  const open = useMemo<boolean>(() => Boolean(anchorEl), [anchorEl]);

  useEffect(() => {
    if (start.relative === 'now') {
      setSign(end.sign);
      setAmount(end.amount);
      setTimeSpan(end.timeSpan);
    } else {
      setSign(start.sign);
      setAmount(start.amount);
      setTimeSpan(start.timeSpan);
    }
  }, [start, end]);

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
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          boxShadow: 'unset',
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
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: theme.spacing(0.5)
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

              <Tooltip title={t('previous_window')}>
                <IconButton
                  size="small"
                  onClick={() => {
                    const [_start, _end] = LuceneDateTime.previousTimeWindow(start, end);
                    const _gap = gap.updateRange(_start, _end).toString();
                    onChange(null, { start: _start, end: _end, gap: _gap });
                  }}
                >
                  <ArrowBackIosNewOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title={t('next_window')}>
                <IconButton
                  size="small"
                  onClick={() => {
                    const [_start, _end] = LuceneDateTime.nextTimeWindow(start, end);
                    const _gap = gap.updateRange(_start, _end).toString();
                    onChange(null, { start: _start, end: _end, gap: _gap });
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
                alignItems: 'start',
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
                value={amount === null ? '' : `${amount}`}
                helperText={amount !== null ? null : t('amount.error')}
                onChange={e => {
                  if ([null, undefined, '', NaN].includes(e.target.value)) setAmount(null);
                  else setAmount(Number(e.target.value));
                }}
                slotProps={{
                  input: { inputProps: { min: 0 } },
                  formHelperText: { sx: { color: theme.palette.error.main } }
                }}
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
                disabled={amount === null}
                size="small"
                variant="contained"
                onClick={e => {
                  onChange(
                    e,
                    sign === '+'
                      ? {
                          start: 'end',
                          end: `now${sign}${amount}${timeSpan}`,
                          gap: gap.updateRange('now', `now${sign}${amount}${timeSpan}`).toString()
                        }
                      : {
                          start: `now${sign}${amount}${timeSpan}`,
                          end: 'now',
                          gap: gap.updateRange(`now${sign}${amount}${timeSpan}`, 'now').toString()
                        }
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

export const GAP_DATETIME_OPTIONS = [
  { primary: '.s', value: 's' },
  { primary: '.m', value: 'm' },
  { primary: '.h', value: 'h' },
  { primary: '.d', value: 'd' }
] as const;

type GapInputProps = {
  value: LuceneDateTimeGap;
  disabled: boolean;
  onChange: (event: unknown, values: string) => void;
  onApply: () => void;
};

const GapInput = ({ value = null, disabled = false, onChange = () => null, onApply = () => null }: GapInputProps) => {
  const theme = useTheme();
  const { t } = useTranslation('dateTime');

  const [amount, setAmount] = useState<number>(value.amount);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const open = useMemo<boolean>(() => Boolean(anchorEl), [anchorEl]);

  useEffect(() => {
    setAmount(value.amount);
  }, [value?.amount]);

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
          width: 'auto',
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          paddingLeft: theme.spacing(0.75),
          paddingRight: theme.spacing(0.75),
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {value.getGap()}
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
        slotProps={{ paper: { sx: { padding: theme.spacing(2), border: `1px solid ${theme.palette.divider}` } } }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            rowGap: theme.spacing(1)
          }}
        >
          <Typography color="textSecondary" variant="body2" sx={{ flex: 1 }}>
            {t('interval_gap')}
          </Typography>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              alignItems: 'start',
              columnGap: theme.spacing(1)
            }}
          >
            <TextField
              id="gap-amount-input"
              size="small"
              type="number"
              variant="outlined"
              value={amount === null ? '' : `${amount}`}
              helperText={amount !== null ? null : t('gap.amount.error')}
              onChange={e => {
                const newAmount = [null, undefined, '', NaN].includes(e.target.value)
                  ? null
                  : Math.max(Number(e.target.value), 1);
                value.amount = newAmount === null ? value.amount : newAmount;
                setAmount(newAmount);
                onChange(e, `${value.amount}${value.timeSpan}`);
              }}
              slotProps={{
                input: { inputProps: { min: 1 } },
                formHelperText: { sx: { color: theme.palette.error.main } }
              }}
            />

            <Select
              id="gap-datetime-select"
              size="small"
              value={value.timeSpan}
              defaultValue={`h`}
              onChange={e => onChange(e, `${amount}${e.target.value || 'h'}`)}
            >
              {GAP_DATETIME_OPTIONS.map(({ primary, value }, i) => (
                <MenuItem key={`${value}-${i}`} value={value}>
                  {t(primary)}
                </MenuItem>
              ))}
            </Select>
          </div>
        </div>
      </Popover>
    </>
  );
};

type DateTimeProps = {
  value: LuceneDateTime;
  variant: 'start' | 'end';
  otherRounding?: TimeSpan;
  onChange: (event: unknown, value: string) => void;
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
  { primary: '-s', value: '-s' },
  { primary: '-m', value: '-m' },
  { primary: '-h', value: '-h' },
  { primary: '-d', value: '-d' },
  { primary: '-w', value: '-w' },
  { primary: '-M', value: '-M' },
  { primary: '-y', value: '-y' },

  { primary: '+s', value: '+s' },
  { primary: '+m', value: '+m' },
  { primary: '+h', value: '+h' },
  { primary: '+d', value: '+d' },
  { primary: '+w', value: '+w' },
  { primary: '+M', value: '+M' },
  { primary: '+y', value: '+y' }
] as const;

export const RELATIVE_DATETIME_OPTIONS2 = [
  { primary: 's', value: 's' },
  { primary: 'm', value: 'm' },
  { primary: 'h', value: 'h' },
  { primary: 'd', value: 'd' },
  { primary: 'w', value: 'w' },
  { primary: 'M', value: 'M' },
  { primary: 'y', value: 'y' }
] as const;

const RelativeTab = ({ value = null, variant, otherRounding = null, onChange = () => null }: DateTimeProps) => {
  const { t } = useTranslation('dateTime');
  const theme = useTheme();

  const [amount, setAmount] = useState<number>(value.amount);

  useEffect(() => {
    setAmount(value.amount);
  }, [value?.amount]);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        alignItems: 'start',
        gap: theme.spacing(1)
      }}
    >
      <TextField
        id="relative-amount-input"
        size="small"
        type="number"
        variant="outlined"
        value={amount === null ? '' : `${amount}`}
        helperText={amount !== null ? null : t('amount.error')}
        onChange={e => {
          const newAmount = [null, undefined, '', NaN].includes(e.target.value) ? null : Number(e.target.value);
          value.amount = newAmount === null ? value.amount : newAmount;
          setAmount(newAmount);
          onChange(e, value.toStringifiedParts());
        }}
        slotProps={{ input: { inputProps: { min: 0 } }, formHelperText: { sx: { color: theme.palette.error.main } } }}
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
        {RELATIVE_DATETIME_OPTIONS.map(({ primary, value }, i) => (
          <MenuItem key={`${value}-${i}`} value={value}>
            {t(primary)}
          </MenuItem>
        ))}
      </Select>

      <div style={{ gridColumn: 'span 2' }}>
        <Select
          id="timeSpan-input"
          size="small"
          fullWidth
          value={value.rounding}
          defaultValue={'h'}
          // onChange={e => setTimeSpan(e.target.value as TimeSpan)}
          displayEmpty
          onChange={e => {
            value.rounding = e.target.value as TimeSpan;
            onChange(e, value.toStringifiedParts());
          }}
        >
          <MenuItem color={theme.palette.text.disabled} value={null}>
            {t('no.rounding')}
          </MenuItem>
          {Object.keys(TIME_SPAN)
            .filter(v =>
              otherRounding === null
                ? true
                : variant === 'start'
                  ? TIME_SPAN[v] >= TIME_SPAN[otherRounding]
                  : TIME_SPAN[v] <= TIME_SPAN[otherRounding]
            )
            .map(v => (
              <MenuItem key={v} value={v}>
                {t(`/${v}`)}
              </MenuItem>
            ))}
        </Select>
      </div>

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
    </div>
  );
};

type DateTimeInputProps = {
  value: LuceneDateTime;
  variant: 'start' | 'end';
  disabled?: boolean;
  hasGap?: boolean;
  otherRounding?: TimeSpan;
  onChange: (event: unknown, value: string) => void;
  onApply: () => void;
};

const DateTimeInput = ({
  value = null,
  variant,
  disabled = false,
  hasGap = true,
  otherRounding = null,
  onChange = () => null,
  onApply = () => null
}: DateTimeInputProps) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation('dateTime');

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [tab, setTab] = useState<'absolute' | 'relative' | 'now'>(value.type);

  const open = useMemo<boolean>(() => Boolean(anchorEl), [anchorEl]);

  useEffect(() => {
    setTab(value.type);
  }, [value.type]);

  const [amount, setAmount] = useState<number>(value.amount);

  useEffect(() => {
    setAmount(value.amount);
  }, [value?.amount]);

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
          width: 'auto',
          borderRadius: 0,
          paddingLeft: theme.spacing(0.75),
          paddingRight: theme.spacing(0.75),
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          ...(!hasGap && {
            borderTopRightRadius: theme.spacing(0.5),
            borderBottomRightRadius: theme.spacing(0.5)
          })
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
        slotProps={{
          paper: {
            sx: {
              width: '500px',
              border: `1px solid ${theme.palette.divider}`,
              // padding: theme.spacing(2),
              display: 'flex',
              flexDirection: 'column'
              // rowGap: theme.spacing(2)
            }
          }
        }}
      >
        <div
          style={{
            padding: theme.spacing(1),
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'nowrap',
            alignItems: 'end',
            gap: theme.spacing(1)
          }}
        >
          <div>
            <Typography
              component={InputLabel}
              variant="body2"
              whiteSpace="nowrap"
              gutterBottom
              children={value.sign === '+' ? t('time_from_now') : t('time_ago')}
            />
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'nowrap',
                gap: theme.spacing(1)
              }}
            >
              <TextField
                id="relative-amount-input"
                size="small"
                type="number"
                variant="outlined"
                value={amount === null ? '' : `${amount}`}
                helperText={amount !== null ? null : t('amount.error')}
                onChange={e => {
                  const newAmount = [null, undefined, '', NaN].includes(e.target.value) ? null : Number(e.target.value);
                  value.amount = newAmount === null ? value.amount : newAmount;
                  setAmount(newAmount);
                  onChange(e, value.toStringifiedParts());
                }}
                sx={{ width: '100px' }}
                slotProps={{
                  input: { inputProps: { min: 0 } },
                  formHelperText: { sx: { color: theme.palette.error.main } }
                }}
              />

              <Select
                id="relative-datetime-select"
                size="small"
                value={value.timeSpan}
                defaultValue={`-h`}
                onChange={e => {
                  value.timeSpan = e.target.value as TimeSpan;
                  onChange(e, value.toStringifiedParts());
                }}
                sx={{ width: '135px' }}
              >
                {Object.keys(TIME_SPAN).map((value, i) => (
                  <MenuItem key={`${value}-${i}`} value={value}>
                    {t(`.${value}`)}
                  </MenuItem>
                ))}
              </Select>
            </div>
          </div>

          <ToggleButtonGroup
            size="small"
            aria-label="text alignment"
            exclusive
            value={value.sign}
            onChange={(e, v) => {
              value.sign = v as '+' | '-';
              onChange(e, value.toStringifiedParts());
            }}
            sx={{ height: '40px' }}
          >
            <ToggleButton value="-" aria-label="left aligned">
              <HistoryOutlinedIcon />
            </ToggleButton>
            <ToggleButton value="+" aria-label="centered">
              <UpdateOutlinedIcon />
            </ToggleButton>
          </ToggleButtonGroup>

          <div>
            <Typography
              component={InputLabel}
              variant="body2"
              whiteSpace="nowrap"
              gutterBottom
              children={t('rounded_to')}
            />
            <Select
              id="timeSpan-input"
              size="small"
              fullWidth
              value={value.rounding}
              defaultValue={'h'}
              // onChange={e => setTimeSpan(e.target.value as TimeSpan)}
              displayEmpty
              onChange={e => {
                value.rounding = e.target.value as TimeSpan;
                onChange(e, value.toStringifiedParts());
              }}
              sx={{ width: '135px' }}
            >
              <MenuItem color={theme.palette.text.disabled} value={null}>
                {t('none')}
              </MenuItem>
              {Object.keys(TIME_SPAN)
                .filter(v =>
                  otherRounding === null
                    ? true
                    : variant === 'start'
                      ? TIME_SPAN[v] >= TIME_SPAN[otherRounding]
                      : TIME_SPAN[v] <= TIME_SPAN[otherRounding]
                )
                .map(v => (
                  <MenuItem key={v} value={v}>
                    {t(`.${v}`)}
                  </MenuItem>
                ))}
            </Select>
          </div>
        </div>

        <Divider />

        <div
          style={{
            width: '100%',
            padding: theme.spacing(1),
            display: 'grid',
            gridTemplateColumns: 'auto auto',
            justifyContent: 'content',
            gap: theme.spacing(0.25)
          }}
        >
          <StyledDateCalendar value={value.absolute} onChange={(v: Moment) => onChange(null, v.toISOString())} />
          <StyledDigitalClock value={value.absolute} onChange={(v: Moment) => onChange(null, v.toISOString())} />
        </div>

        <Divider />

        <div style={{ padding: theme.spacing(1) }}>
          <Typography
            component={InputLabel}
            variant="body2"
            whiteSpace="nowrap"
            gutterBottom
            children={variant === 'start' ? t('start_date') : t('end_date')}
          />
          <StyledDateTimePicker value={value.absolute} onChange={v => onChange(null, v.toISOString())} />
        </div>
      </Popover>
    </>
  );
};

export type DateTimeRangePickerProps = {
  value?: { start: string; end: string; gap?: string };
  disabled?: boolean;
  interval?: number;
  defaultGap?: `${number}${TimeSpan}`;
  hasGap?: boolean;
  onChange?: (event: unknown, values: { start: string; end: string; gap?: string }) => void;
};

export const DateTimeRangePicker: React.FC<DateTimeRangePickerProps> = React.memo(
  ({
    value,
    disabled = false,
    interval = 50,
    defaultGap = '4h',
    hasGap = false,
    onChange = () => null
  }: DateTimeRangePickerProps) => {
    const { i18n } = useTranslation('dateTime');
    const theme = useTheme();

    const {
      start: startRaw,
      end: endRaw,
      gap: gapRaw
    } = useMemo<{ start: string; end: string; gap?: string }>(() => value, [value]);

    const [start, setStart] = useState<LuceneDateTime>(new LuceneDateTime(startRaw, 'start'));
    const [end, setEnd] = useState<LuceneDateTime>(new LuceneDateTime(endRaw, 'end'));
    const [gap, setGap] = useState<LuceneDateTimeGap>(
      new LuceneDateTimeGap(gapRaw, startRaw, endRaw, interval, defaultGap, hasGap)
    );
    const [error, setError] = useState<boolean>(false);

    const validateDateTimeRange = useCallback(
      (earlier: LuceneDateTime, later: LuceneDateTime): boolean => later.toValue() - earlier.toValue() >= 1000,
      []
    );

    const applyChanges = useCallback(() => {
      if (!validateDateTimeRange(start, end)) {
        setError(true);
      } else {
        setError(null);
        onChange(null, { start: start.toLucene(), end: end.toLucene(), gap: gap.toString() });
      }
    }, [validateDateTimeRange, start, end, onChange, gap]);

    useEffect(() => {
      setStart(new LuceneDateTime(startRaw, 'start'));
      setEnd(new LuceneDateTime(endRaw, 'end'));
      setGap(new LuceneDateTimeGap(gapRaw, startRaw, endRaw, interval, defaultGap, hasGap));
    }, [defaultGap, endRaw, gapRaw, hasGap, interval, startRaw]);

    useEffect(() => {
      configureMomentLocale(i18n.language);
    }, [i18n.language]);

    return (
      <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale={i18n.language}>
        <div style={{ flex: 0, width: '100%', display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              minHeight: '40px',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '4px',
              ...(error && { border: `1px solid ${theme.palette.error.main}` })
            }}
          >
            <QuickSelectMenu
              start={start}
              end={end}
              gap={gap}
              disabled={disabled}
              onChange={(e, v) => {
                setError(null);
                onChange(e, v);
              }}
            />

            <DateTimeInput
              value={start}
              variant="start"
              disabled={disabled}
              otherRounding={end.rounding}
              onChange={(e, v) => setStart(() => new LuceneDateTime(v))}
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
              value={end}
              variant="end"
              disabled={disabled}
              otherRounding={start.rounding}
              hasGap={hasGap}
              onChange={(e, v) => setEnd(() => new LuceneDateTime(v))}
              onApply={() => applyChanges()}
            />

            {hasGap && (
              <>
                <Divider orientation="vertical" flexItem />

                <GapInput
                  value={gap}
                  disabled={disabled}
                  onChange={(e, v) =>
                    setGap(() => new LuceneDateTimeGap(v, start.toLucene(), end.toLucene(), interval, defaultGap))
                  }
                  onApply={() => applyChanges()}
                />
              </>
            )}
          </div>
        </div>
      </LocalizationProvider>
    );
  }
);
