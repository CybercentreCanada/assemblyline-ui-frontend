import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';
import StarIcon from '@mui/icons-material/Star';
import {
  Autocomplete,
  Button,
  Drawer,
  FormControl,
  IconButton,
  ListItemIcon,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import useMyAPI from 'components/hooks/useMyAPI';
import { DEFAULT_PARAMS, DEFAULT_QUERY } from 'components/routes/alerts';
import CustomChip from 'components/visual/CustomChip';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import { safeFieldValue } from 'helpers/utils';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
import { useAlerts } from '../contexts/AlertsContext';
import { buildSearchQuery } from '../utils/alertUtils';
import { Favorite } from './Favorites';

const useStyles = makeStyles(theme => ({
  drawerInner: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(3),
    width: '600px',
    [theme.breakpoints.only('xs')]: {
      width: '100vw'
    }
  },
  listbox: {
    backgroundColor: theme.palette.background.default
  },
  actions: {
    display: 'flex',
    gap: theme.spacing(1),
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    marginTop: theme.spacing(1)
  },
  selectMenu: {
    '& .MuiList-root': {
      backgroundColor: theme.palette.background.default
    }
  },
  option: {
    columnGap: theme.spacing(2)
  },
  desc: {
    transform: 'rotate(0deg)',
    transition: theme.transitions.create('transform', {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.shortest
    })
  },
  asc: {
    transform: 'rotate(180deg)'
  }
}));

export type Filter = {
  label?: string;
  value?: string;
  not?: boolean;
  count?: number;
  total?: number;
};

export type Option = { value: string; label: string };

export const SORT_OPTIONS: Option[] = [
  { value: 'alert_id', label: 'alert_id' },
  { value: 'type', label: 'type' },
  { value: 'ts', label: 'received_ts' },
  { value: 'reporting_ts', label: 'alerted_ts' },
  { value: 'owner', label: 'owner' },
  { value: 'priority', label: 'priority' },
  { value: 'status', label: 'status' }
];

export const TC_OPTIONS: Option[] = [
  { value: '', label: 'tc.none' },
  { value: '24h', label: 'tc.24h' },
  { value: '4d', label: 'tc.4d' },
  { value: '1w', label: 'tc.1week' },
  { value: '1M', label: 'tc.1month' }
];

export const GROUPBY_OPTIONS: Option[] = [
  { value: '', label: 'groupBy.none' },
  { value: 'file.md5', label: 'groupBy.md5' },
  { value: 'file.name', label: 'groupBy.name' },
  { value: 'file.sha256', label: 'groupBy.sha256' },
  { value: 'priority', label: 'groupBy.priority' },
  { value: 'status', label: 'groupBy.status' }
];

type AlertSortProps = {
  value: string;
  onChange: (value: string) => void;
};

const AlertSort: React.FC<AlertSortProps> = React.memo(({ value = null, onChange = () => null }: AlertSortProps) => {
  const { t } = useTranslation('alerts');
  const classes = useStyles();
  const theme = useTheme();

  const [open, setOpen] = useState<boolean>(false);

  const menuRef = useRef(null);

  const [field, dir] = useMemo<[string, string]>(() => {
    const defaults = DEFAULT_PARAMS.sort.toString().split(' ');
    try {
      if (SORT_OPTIONS.some(o => value.startsWith(o.value)) && ['asc', 'desc'].some(v => value.endsWith(v))) {
        const values = value.split(' ');
        return [values[0], values[values.length - 1]];
      } else return [defaults[0], defaults[defaults.length - 1]];
    } catch (error) {
      return [defaults[0], defaults[defaults.length - 1]];
    }
  }, [value]);

  const handleClose = useCallback(
    (event: any) => (event?.code === 'Escape' || !menuRef.current.contains(event.target) ? setOpen(false) : null),
    []
  );

  return (
    <div style={{ marginBottom: theme.spacing(2) }}>
      <FormControl fullWidth variant="outlined">
        <label>{t('sortBy')}</label>
        <Select
          open={open}
          value={field}
          onOpen={() => setOpen(true)}
          onClose={handleClose}
          MenuProps={{ className: classes.selectMenu, MenuListProps: { ref: menuRef } }}
          renderValue={() => (
            <div style={{ display: 'flex', columnGap: theme.spacing(1) }}>
              <ArrowDownwardIcon className={clsx(classes.desc, dir.endsWith('asc') && classes.asc)} />
              <Typography>{t(SORT_OPTIONS.find(o => o.value === field).label)}</Typography>
            </div>
          )}
        >
          {SORT_OPTIONS.map(option => (
            <MenuItem
              key={option.value}
              value={option.value}
              onClick={(event: any) =>
                onChange(field === option.value && dir === 'desc' ? `${option.value} asc` : `${option.value} desc`)
              }
            >
              <ListItemIcon>
                {field === option.value && (
                  <ArrowDownwardIcon className={clsx(classes.desc, dir === 'asc' && classes.asc)} />
                )}
              </ListItemIcon>
              {t(option.label)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
});

type AlertSelectProps = {
  value: string;
  defaultValue: string;
  label: string;
  options: Option[];
  onChange: (value: string) => void;
};

const AlertSelect: React.FC<AlertSelectProps> = React.memo(
  ({ value = null, defaultValue = null, label = '', options = [], onChange = () => null }: AlertSelectProps) => {
    const { t } = useTranslation('alerts');
    const classes = useStyles();
    const theme = useTheme();

    return (
      <div style={{ marginBottom: theme.spacing(2) }}>
        <FormControl fullWidth variant="outlined">
          <label>{t(label)}</label>
          <Select
            displayEmpty
            value={options.map(option => option.value).includes(value) ? value : defaultValue}
            onChange={event => onChange(event.target.value as string)}
            MenuProps={{ className: classes.selectMenu }}
          >
            {options.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {t(option.label)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    );
  }
);

type AlertFilterInputProps = {
  label: string;
  value: Filter[];
  loading?: boolean;
  freeSolo?: boolean;
  disableCloseOnSelect?: boolean;
  options: Filter[];
  onOpen?: () => void;
  onChange: (values: Filter[]) => void;
};

const AlertFilterInput: React.FC<AlertFilterInputProps> = React.memo(
  ({
    label = '',
    value: filters = [],
    loading = false,
    freeSolo = false,
    disableCloseOnSelect = false,
    options = [],
    onOpen = () => null,
    onChange = () => null
  }: AlertFilterInputProps) => {
    const { t } = useTranslation('alerts');
    const classes = useStyles();
    const theme = useTheme();

    const [inputValue, setInputValue] = useState<string>('');

    return (
      <div style={{ marginBottom: theme.spacing(2) }}>
        <label>{t(label)}</label>
        <Autocomplete
          classes={{ listbox: classes.listbox, option: classes.option }}
          value={filters}
          onChange={(event, items) =>
            onChange(items.map(item => (typeof item !== 'string' ? item : { label: item, value: item, not: false })))
          }
          onOpen={onOpen}
          inputValue={inputValue}
          onInputChange={(event, item) => setInputValue(item)}
          fullWidth
          multiple
          size="small"
          freeSolo={freeSolo}
          disableCloseOnSelect={disableCloseOnSelect}
          loading={loading}
          loadingText={t('loading')}
          renderInput={params => <TextField {...params} variant="outlined" size="medium" />}
          renderTags={(items: Filter[], getTagProps) =>
            items.map((item, index) => (
              <CustomChip
                {...getTagProps({ index })}
                label={item.label}
                size="small"
                variant={item.not ? 'outlined' : 'filled'}
                color={item.not ? 'error' : 'default'}
                onClick={() =>
                  onChange(
                    items.map(value =>
                      value.label !== item.label
                        ? value
                        : typeof value !== 'string'
                        ? { ...value, not: !value.not }
                        : { label: value, value: value, not: true }
                    )
                  )
                }
              />
            ))
          }
          options={options}
          getOptionLabel={option => (typeof option === 'string' ? option : option.label)}
          isOptionEqualToValue={(option, filter) => !!option && !!filter && option.label === filter.label}
          renderOption={(props, item, state) => (
            <li {...props} key={item.value} style={{ justifyContent: 'space-between' }}>
              <Typography
                color={item.count > 0 ? theme.palette.text.primary : theme.palette.text.disabled}
                style={{ wordBreak: 'break-all' }}
                children={item.label}
              />
              <CustomChip
                label={
                  <>
                    <span style={{ color: theme.palette.text.primary }}>{`${item.count} `}</span>
                    {item.total && <span style={{ color: theme.palette.text.secondary }}>{`/ ${item.total}`}</span>}
                  </>
                }
                size="small"
              />
            </li>
          )}
        />
      </div>
    );
  }
);

type FavoritesProps = {
  value: (Filter & Favorite)[];
  onChange: (values: (Filter & Favorite)[]) => void;
};

const Favorites: React.FC<FavoritesProps> = React.memo(
  ({ value: favorites = [], onChange = () => null }: FavoritesProps) => {
    const { t } = useTranslation('alerts');
    const classes = useStyles();
    const theme = useTheme();

    const alertValues = useAlerts();

    const options = useMemo<(Filter & Favorite)[]>(
      () => (!alertValues ? [] : [...alertValues?.userFavorites, ...alertValues?.globalFavorites]),
      [alertValues]
    );

    return (
      <div style={{ marginBottom: theme.spacing(2) }}>
        <label>{t('favorites')}</label>
        <Autocomplete
          classes={{ listbox: classes.listbox, option: classes.option }}
          value={favorites}
          onChange={(event, items) =>
            onChange(items.map(item => ({ ...item, label: item.query, value: item.query, not: false })))
          }
          fullWidth
          multiple
          size="small"
          disableCloseOnSelect
          renderInput={params => <TextField {...params} variant="outlined" size="medium" />}
          renderTags={(items: (Filter & Favorite)[], getTagProps) =>
            items.map((item, index) => (
              <CustomChip
                {...getTagProps({ index })}
                label={item.name}
                icon={
                  <StarIcon
                    style={{
                      ...(item.not && {
                        color: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark
                      })
                    }}
                  />
                }
                size="small"
                variant={item.not ? 'outlined' : 'filled'}
                color={item.not ? 'error' : 'default'}
                onClick={() =>
                  onChange(items.map(value => (value.label !== item.label ? value : { ...value, not: !value.not })))
                }
              />
            ))
          }
          options={options}
          getOptionLabel={option => option.name}
          isOptionEqualToValue={(option, against) =>
            option === null || against === null ? false : option.query === against.query
          }
          renderOption={(props, item, state) => (
            <li {...props} key={`${item.name}-${item.query}`}>
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  columnGap: theme.spacing(2)
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Typography color={theme.palette.text.primary} noWrap children={item.name} />
                  <Typography
                    color={theme.palette.text.secondary}
                    noWrap
                    component="div"
                    variant="caption"
                    children={item.query}
                  />
                </div>
                <div>
                  <Typography
                    color={theme.palette.text.disabled}
                    variant="body2"
                    noWrap
                    children={`(${item.created_by})`}
                  />
                </div>
              </div>
            </li>
          )}
        />
      </div>
    );
  }
);

type FilterType = 'status' | 'priority' | 'label' | 'other';

type Filters = {
  status: Filter[];
  priority: Filter[];
  labels: Filter[];
  favorites: (Favorite & Filter)[];
  others: Filter[];
};

const WrappedAlertFilters = () => {
  const { t } = useTranslation('alerts');
  const classes = useStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { apiCall } = useMyAPI();

  const alertValues = useAlerts();

  const isMDUp = useMediaQuery(theme.breakpoints.up('md'));

  const [query, setQuery] = useState(new SimpleSearchQuery(location.search, DEFAULT_QUERY));
  const [open, setOpen] = useState<boolean>(false);
  const [render, setRender] = useState<boolean>(false);
  const [options, setOptions] = useState<Record<FilterType, Record<string, { count: number; total: number }>>>({
    status: {},
    priority: {},
    label: {},
    other: {}
  });
  const [loadings, setLoadings] = useState<Record<FilterType, boolean>>({
    status: false,
    priority: false,
    label: false,
    other: false
  });

  const prevURLs = useRef<Record<FilterType, string>>({ status: '', priority: '', label: '', other: '' });

  const allFavorites = useMemo<Favorite[]>(
    () => (!alertValues ? [] : [...alertValues?.userFavorites, ...alertValues?.globalFavorites]),
    [alertValues]
  );

  const filters = useMemo<Filters>(() => {
    let defaults: Filters = { status: [], priority: [], labels: [], favorites: [], others: [] };

    const statuses = Object.fromEntries(Object.keys(options.status).map(v => [`status:${v}`, v]));
    const priorities = Object.fromEntries(Object.keys(options.priority).map(v => [`priority:${v}`, v]));
    const labels = Object.fromEntries(Object.keys(options.label).map(v => [`label:${v}`, v]));

    query.getAll('fq', []).forEach((fq: string) => {
      const not = fq.startsWith('NOT(') && fq.endsWith(')');
      const value = not ? fq.substring(4, fq.length - 1) : fq;

      if (value in statuses) {
        defaults.status = [{ not, value, label: statuses[value] }];
      } else if (value in priorities) {
        defaults.priority = [{ not, value, label: priorities[value] }];
      } else if (value in labels) {
        defaults.labels.push({ not, value, label: labels[value] });
      } else {
        const favorite = allFavorites.find(f => f.query === value);
        if (favorite) defaults.favorites.push({ ...favorite, not, value, label: value });
        else defaults.others.push({ not, value, label: value });
      }
    });
    return defaults;
  }, [allFavorites, options.label, options.priority, options.status, query]);

  const urls = useMemo<Record<FilterType, string>>(
    () => ({
      ...Object.fromEntries(
        [
          ['status', ['/api/v4/alert/statuses/', 'status:']],
          ['priority', ['/api/v4/alert/priorities/', 'priority:']],
          ['label', ['/api/v4/alert/labels/', 'labels:']]
        ].map(([url, [pathname, strip]]) => [
          url,
          `${pathname}?${buildSearchQuery({
            search: query.getDeltaString(),
            singles: ['q', 'tc', 'tc_start', 'no_delay'],
            multiples: ['fq'],
            strip: [strip],
            defaultString: DEFAULT_QUERY,
            groupByAsFilter: true
          }).toString()}`
        ])
      ),
      other: ''
    }),
    [query]
  );

  const otherURL = useMemo<string>(() => {
    const q = buildSearchQuery({
      search: query.getDeltaString(),
      singles: ['q', 'tc', 'tc_start', 'no_delay'],
      multiples: ['fq'],
      defaultString: DEFAULT_QUERY,
      groupByAsFilter: true
    });

    filters.others.forEach(filter => {
      q.remove('fq', filter.value);
    });
    return `/api/v4/alert/statistics/?${q.toString()}`;
  }, [filters.others, query]);

  const toFilterOptions = useCallback(
    (values: Record<string, { count: number; total: number }>, prefix: string = ''): Filter[] => {
      let data = Object.keys(values).map(key => ({
        ...values[key],
        not: false,
        label: key,
        value: `${prefix}${key}`
      }));
      data.sort((a, b) => a.value.localeCompare(b.value));
      return data;
    },
    []
  );

  const handleClear = useCallback(() => setQuery(new SimpleSearchQuery('', DEFAULT_QUERY)), []);

  const handleApply = useCallback(() => {
    navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
    setOpen(false);
  }, [location.hash, location.pathname, navigate, query]);

  const handleQueryChange = useCallback((key: string, value: string) => {
    setQuery(prev => {
      const q = new SimpleSearchQuery(prev.toString([]), DEFAULT_QUERY);
      q.set(key, value);
      return q;
    });
  }, []);

  const handleFiltersChange = useCallback(
    (prefix: string, next: Filter[], previous: Filter[], limit: number = null) => {
      setQuery(prev => {
        const q = new SimpleSearchQuery(prev.toString([]), DEFAULT_QUERY);

        console.log(previous, next);

        previous.forEach(fq => {
          q.remove('fq', fq.not ? `NOT(${fq.value})` : `${fq.value}`);
        });

        next.slice(!limit ? 0 : -1 * limit).forEach(fq => {
          q.add('fq', fq.not ? `NOT(${prefix}${fq.label})` : `${prefix}${fq.label}`);
        });

        return q;
      });
    },
    []
  );

  const handleOptionsChange = useCallback(
    (type: FilterType, data: Record<string, number>, asTotal: boolean = false) => {
      setOptions(v => {
        if (!(type in v)) return v;
        return {
          ...v,
          [type]: Object.fromEntries(
            Object.keys({ ...v[type], ...data }).map(k => [
              k,
              {
                count: 0,
                total: 0,
                ...(k in v[type] && v[type][k]),
                ...(!(k in data) ? null : asTotal ? { total: data[k] } : { count: data[k] })
              }
            ])
          )
        };
      });
    },
    []
  );

  const handleOthersChange = useCallback((data: Record<string, Record<string, number>>, asTotal: boolean = false) => {
    setOptions(v => ({
      ...v,
      other: Object.fromEntries(
        Object.keys(data).flatMap(key =>
          Object.keys(data[key]).map(value => [
            `${key}:${safeFieldValue(value)}`,
            { count: data[key][value], total: null }
          ])
        )
      )
    }));
  }, []);

  const handleFetch = useCallback((type: FilterType, url: string, onChange: (data: any) => void) => {
    if (!type || !url || prevURLs.current?.[type] === url) return;
    apiCall({
      url: url,
      method: 'GET',
      onSuccess: ({ api_response }) => {
        onChange(api_response);
        prevURLs.current[type] = url;
      },
      onEnter: () => setLoadings(v => ({ ...v, [type]: true })),
      onExit: () => setLoadings(v => ({ ...v, [type]: false }))
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (open) setQuery(new SimpleSearchQuery(location.search, DEFAULT_QUERY));
  }, [location.search, open]);

  useEffect(() => {
    if (render) {
      handleFetch('status', '/api/v4/alert/statuses/', data => handleOptionsChange('status', data, true));
      handleFetch('priority', '/api/v4/alert/priorities/', data => handleOptionsChange('priority', data, true));
      handleFetch('label', '/api/v4/alert/labels/', data => handleOptionsChange('label', data, true));
    }
  }, [handleFetch, handleOptionsChange, handleOthersChange, render]);

  console.log(filters.favorites);

  return (
    <>
      <Tooltip title={t('filters')}>
        <span>
          <IconButton
            size="large"
            onClick={() => {
              setOpen(true);
              setRender(true);
            }}
            style={{ marginRight: 0 }}
          >
            <FilterListIcon fontSize={isMDUp ? 'medium' : 'small'} />
          </IconButton>
        </span>
      </Tooltip>

      <Drawer open={open} anchor="right" onClose={() => setOpen(false)}>
        {render && (
          <>
            <div style={{ padding: theme.spacing(1) }}>
              <IconButton onClick={() => setOpen(false)} size="large">
                <CloseOutlinedIcon />
              </IconButton>
            </div>
            <div className={classes.drawerInner}>
              <div style={{ paddingBottom: theme.spacing(2) }}>
                <Typography variant="h4">{t('filters')}</Typography>
              </div>
              <div style={{ marginBottom: theme.spacing(2), marginTop: theme.spacing(2) }}>
                <AlertSort
                  value={query.has('sort') ? query.get('sort', '') : DEFAULT_PARAMS.sort.toString()}
                  onChange={value => handleQueryChange('sort', value)}
                />

                <AlertSelect
                  label="tc"
                  value={query.has('tc') ? query.get('tc', '') : DEFAULT_PARAMS.tc.toString()}
                  defaultValue={DEFAULT_PARAMS.tc}
                  options={TC_OPTIONS}
                  onChange={value => handleQueryChange('tc', value)}
                />

                <AlertSelect
                  label="groupBy"
                  value={query.has('group_by') ? query.get('group_by', '') : DEFAULT_PARAMS.group_by.toString()}
                  defaultValue={DEFAULT_PARAMS.group_by}
                  options={GROUPBY_OPTIONS}
                  onChange={value => handleQueryChange('group_by', value)}
                />

                <AlertFilterInput
                  label="status"
                  value={filters.status}
                  loading={loadings.status}
                  options={toFilterOptions(options.status, 'status:')}
                  onOpen={() => handleFetch('status', urls.status, data => handleOptionsChange('status', data))}
                  onChange={value => handleFiltersChange('status:', value, filters.status, 1)}
                />

                <AlertFilterInput
                  label="priority"
                  value={filters.priority}
                  loading={loadings.priority}
                  options={toFilterOptions(options.priority, 'priority:')}
                  onOpen={() => handleFetch('priority', urls.priority, data => handleOptionsChange('priority', data))}
                  onChange={value => handleFiltersChange('priority:', value, filters.priority, 1)}
                />

                <AlertFilterInput
                  label="labels"
                  value={filters.labels}
                  loading={loadings.label}
                  disableCloseOnSelect
                  options={toFilterOptions(options.label, 'label:')}
                  onOpen={() => handleFetch('label', urls.label, data => handleOptionsChange('label', data))}
                  onChange={value => handleFiltersChange('label:', value, filters.labels)}
                />

                <Favorites
                  value={filters.favorites}
                  onChange={value => handleFiltersChange('', value, filters.favorites)}
                />

                <AlertFilterInput
                  label="others"
                  value={filters.others}
                  loading={loadings.other}
                  freeSolo
                  disableCloseOnSelect
                  options={toFilterOptions(options.other)}
                  onOpen={() => handleFetch('other', otherURL, data => handleOthersChange(data))}
                  onChange={value => handleFiltersChange('', value, filters.others)}
                />
              </div>
              <div className={classes.actions}>
                <Tooltip title={t('filters.clear')}>
                  <Button variant="outlined" onClick={handleClear}>
                    {t('reset')}
                  </Button>
                </Tooltip>

                <Tooltip title={t('filters.apply')}>
                  <Button variant="contained" color="primary" onClick={handleApply}>
                    {t('apply')}
                  </Button>
                </Tooltip>
              </div>
            </div>
          </>
        )}
      </Drawer>
    </>
  );
};

export const AlertFilters = React.memo(WrappedAlertFilters);
export default AlertFilters;