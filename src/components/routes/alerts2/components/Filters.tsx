import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';
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

type Filter = {
  value?: string;
  query?: string;
  count?: number;
  total?: number;
};

type AlertFilterInputProps = {
  label: string;
  value: string;
  totals: { [key: string]: number };
  url: string;
  onChange: (value: string) => void;
};

const AlertFilterInput: React.FC<AlertFilterInputProps> = React.memo(
  ({ label = '', value: filter = null, totals = null, url = '', onChange = () => null }: AlertFilterInputProps) => {
    const { t } = useTranslation('alerts');
    const classes = useStyles();
    const theme = useTheme();
    const { apiCall } = useMyAPI();

    const [options, setOptions] = useState<{ [key: string]: number }>(null);
    const [inputValue, setInputValue] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const prevURL = useRef<string>(null);

    const parsedOptions = useMemo<Filter[]>(() => {
      const items = Object.keys({ ...options, ...totals }).map(key => ({
        value: key,
        count: options && key in options ? options[key] : 0,
        total: totals && key in totals ? totals[key] : 0
      }));
      items.sort((a, b) => (b.count !== a.count ? b.count - a.count : b.total - a.total));
      return items;
    }, [options, totals]);

    const currentFilter = useMemo<Filter>(
      () => (!filter ? null : parsedOptions.find(o => o.value === filter) ?? null),
      [filter, parsedOptions]
    );

    const fetchOptions = useCallback(
      (currentURL: string) => {
        apiCall({
          url: currentURL,
          method: 'GET',
          onSuccess: ({ api_response }) => {
            setOptions(api_response);
            prevURL.current = url;
          },
          onEnter: () => {
            setLoading(true);
            setOptions(null);
          },
          onExit: () => setLoading(false)
        });
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    );

    return (
      <div style={{ marginBottom: theme.spacing(2) }}>
        <label>{t(label)}</label>
        <Autocomplete
          classes={{ listbox: classes.listbox, option: classes.option }}
          value={currentFilter}
          onChange={(event, item) => onChange(item?.value)}
          onOpen={() => prevURL.current !== url && fetchOptions(url)}
          inputValue={inputValue}
          onInputChange={(event, item) => setInputValue(item)}
          fullWidth
          loading={loading}
          loadingText={t('loading')}
          renderInput={params => <TextField {...params} variant="outlined" />}
          options={parsedOptions}
          getOptionLabel={option => option.value}
          isOptionEqualToValue={(option, item) => !!option && !!item && option.value === item.value}
          renderOption={(props, item, state) => (
            <li {...props} key={JSON.stringify(item)} style={{ justifyContent: 'space-between' }}>
              <Typography
                color={item.count > 0 ? theme.palette.text.primary : theme.palette.text.disabled}
                style={{ wordBreak: 'break-all' }}
                children={item.value}
              />
              <CustomChip
                label={
                  <>
                    <span style={{ color: theme.palette.text.primary }}>{`${item.count} `}</span>
                    <span style={{ color: theme.palette.text.secondary }}>{`/ ${item.total}`}</span>
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

type AlertFiltersInputProps = {
  label: string;
  values: string[];
  totals: { [key: string]: number };
  url: string;
  onChange: (values: string[]) => void;
};

const AlertFiltersInput: React.FC<AlertFiltersInputProps> = React.memo(
  ({ label = '', values: filters = [], totals = null, url = '', onChange = () => null }: AlertFiltersInputProps) => {
    const { t } = useTranslation('alerts');
    const classes = useStyles();
    const theme = useTheme();
    const { apiCall } = useMyAPI();

    const [options, setOptions] = useState<{ [key: string]: number }>(null);
    const [inputValue, setInputValue] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const prevURL = useRef<string>(null);

    const parsedOptions = useMemo<Filter[]>(() => {
      const items = Object.keys({ ...options, ...totals }).map(key => ({
        value: key,
        count: options && key in options ? options[key] : 0,
        total: totals && key in totals ? totals[key] : 0
      }));
      items.sort((a, b) => (b.count !== a.count ? b.count - a.count : b.total - a.total));
      return items;
    }, [options, totals]);

    const currentFilters = useMemo<Filter[]>(
      () => (!filters ? [] : parsedOptions.filter(o => filters.includes(o.value))),
      [filters, parsedOptions]
    );

    const fetchOptions = useCallback(
      (currentURL: string) => {
        apiCall({
          url: currentURL,
          method: 'GET',
          onSuccess: ({ api_response }) => {
            setOptions(api_response);
            prevURL.current = url;
          },
          onEnter: () => {
            setLoading(true);
            setOptions(null);
          },
          onExit: () => setLoading(false)
        });
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    );

    return (
      <div style={{ marginBottom: theme.spacing(2) }}>
        <label>{t(label)}</label>
        <Autocomplete
          classes={{ listbox: classes.listbox, option: classes.option }}
          value={currentFilters}
          onChange={(event, items) => onChange(items.map(f => f.value))}
          onOpen={() => prevURL.current !== url && fetchOptions(url)}
          inputValue={inputValue}
          onInputChange={(event, item) => setInputValue(item)}
          fullWidth
          multiple
          disableCloseOnSelect
          loading={loading}
          loadingText={t('loading')}
          renderInput={params => <TextField {...params} variant="outlined" />}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => <CustomChip size="small" label={option.value} {...getTagProps({ index })} />)
          }
          options={parsedOptions}
          getOptionLabel={option => option.value}
          isOptionEqualToValue={(option, filter) => !!option && !!filter && option.value === filter.value}
          renderOption={(props, item, state) => (
            <li {...props} key={JSON.stringify(item)} style={{ justifyContent: 'space-between' }}>
              <Typography
                color={item.count > 0 ? theme.palette.text.primary : theme.palette.text.disabled}
                style={{ wordBreak: 'break-all' }}
                children={item.value}
              />
              <CustomChip
                label={
                  <>
                    <span style={{ color: theme.palette.text.primary }}>{`${item.count} `}</span>
                    <span style={{ color: theme.palette.text.secondary }}>{`/ ${item.total}`}</span>
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
  values: string[];
  onChange: (values: string[]) => void;
};

const Favorites: React.FC<FavoritesProps> = React.memo(({ values = [], onChange = () => null }: FavoritesProps) => {
  const { t } = useTranslation('alerts');
  const classes = useStyles();
  const theme = useTheme();

  const { userFavorites, globalFavorites } = useAlerts();

  const options = useMemo<Favorite[]>(() => [...userFavorites, ...globalFavorites], [userFavorites, globalFavorites]);

  return (
    <div style={{ marginBottom: theme.spacing(2) }}>
      <label>{t('favorites')}</label>
      <Autocomplete
        classes={{ listbox: classes.listbox, option: classes.option }}
        value={values
          .filter(value => options.map(option => option.query).includes(value))
          .map(value => ({ classification: '', name: '', query: value, created_by: '' }))}
        onChange={(event, value) => onChange(value.map(item => item.query))}
        fullWidth
        multiple
        disableCloseOnSelect
        renderInput={params => <TextField {...params} variant="outlined" />}
        renderTags={(value, getTagProps) =>
          value.map((item, index) => (
            <CustomChip
              size="small"
              label={options.find(option => option.query === item.query).name}
              {...getTagProps({ index })}
            />
          ))
        }
        options={options}
        getOptionLabel={option => option.name}
        isOptionEqualToValue={(option, against) =>
          option === null || against === null ? false : option.query === against.query
        }
        renderOption={(props, item, state) => (
          <li {...props} key={JSON.stringify(item)}>
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
});

type OthersProps = {
  values: string[];
  search: string;
  onChange: (values: string[], favorites: string[]) => void;
};

const Others: React.FC<OthersProps> = React.memo(({ values = [], search = '', onChange = () => null }: OthersProps) => {
  const { t } = useTranslation('alerts');
  const classes = useStyles();
  const theme = useTheme();
  const { apiCall } = useMyAPI();

  const [options, setOptions] = useState<{ [key: string]: { [item: string]: number } }>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const prevSearch = useRef<string>(null);

  const parsedOptions = useMemo<Filter[]>(() => {
    const items = Object.keys({ ...options }).flatMap(key =>
      Object.keys({ ...(options && key in options ? options[key] : null) }).map(value => ({
        value: `${key}:${safeFieldValue(value)}`,
        count: options && key in options && value in options[key] ? options[key][value] : 0,
        total: 0
      }))
    );
    return items;
  }, [options]);

  const fetchOptions = useCallback(() => {
    apiCall({
      url: `/api/v4/alert/statistics/?${search}`,
      method: 'GET',
      onSuccess: ({ api_response }) => {
        setOptions(api_response);
        prevSearch.current = search;
      },
      onEnter: () => {
        setLoading(true);
        setOptions(null);
      },
      onExit: () => setLoading(false)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div style={{ marginBottom: theme.spacing(2) }}>
      <label>{t('others')}</label>
      <Autocomplete
        classes={{ listbox: classes.listbox, option: classes.option }}
        value={values
          .filter(value => parsedOptions.map(option => option.value).includes(value))
          .map(value => ({ value, count: 0, total: 0 }))}
        onChange={(event, value) =>
          onChange(
            value.map(item => item.value),
            parsedOptions.map(option => option.value)
          )
        }
        onOpen={() => prevSearch.current !== search && fetchOptions()}
        fullWidth
        multiple
        disableCloseOnSelect
        loading={loading}
        loadingText={t('loading')}
        renderInput={params => <TextField {...params} variant="outlined" />}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => <CustomChip size="small" label={option.value} {...getTagProps({ index })} />)
        }
        options={parsedOptions}
        getOptionLabel={option => option.value}
        isOptionEqualToValue={(option, against) =>
          option === null || against === null ? false : option.value === against.value
        }
        renderOption={(props, item, state) => (
          <li {...props} key={JSON.stringify(item)} style={{ justifyContent: 'space-between' }}>
            <Typography
              color={item.count > 0 ? theme.palette.text.primary : theme.palette.text.disabled}
              style={{ wordBreak: 'break-all' }}
              children={item.value}
            />
            <CustomChip
              label={
                <>
                  <span style={{ color: theme.palette.text.primary }}>{`${item.count} `}</span>
                </>
              }
              size="small"
            />
          </li>
        )}
      />
    </div>
  );
});

type Filters = {
  status: Filter;
  priority: Filter;
  labels: Filter[];
  favorites: Filter[];
  others: Filter[];
};

const WrappedAlertFilters = () => {
  const { t } = useTranslation('alerts');
  const classes = useStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const { userFavorites, globalFavorites, statusFilters, priorityFilters, labelFilters } = useAlerts();

  const isMDUp = useMediaQuery(theme.breakpoints.up('md'));

  const [query, setQuery] = useState(new SimpleSearchQuery(location.search, DEFAULT_QUERY));
  const [open, setOpen] = useState<boolean>(false);
  const [render, setRender] = useState<boolean>(false);

  const allFavorites = useMemo<Favorite[]>(
    () => [...userFavorites, ...globalFavorites],
    [globalFavorites, userFavorites]
  );

  const { status, priority, labels, favorites, others } = useMemo<Filters>(() => {
    let filters = { status: null, priority: null, labels: [], favorites: [], others: [] };

    query.getAll('fq', []).forEach(filter => {
      const value = filter.startsWith('NOT(') && filter.endsWith(')') ? filter.substring(4, filter.length - 1) : filter;

      if (value.startsWith('status:')) {
        filters.status = { query: filter, value: value.replace('status:', '') };
      } else if (value.startsWith('priority:')) {
        filters.priority = { query: filter, value: value.replace('priority:', '') };
      } else if (value.startsWith('label:')) {
        filters.labels.push({ query: filter, value: value.replace('label:', '') });
      } else {
        const favorite = allFavorites.find(f => f.query === filter || `NOT(${f.query})` === filter);
        if (favorite) filters.favorites.push({ query: filter, value: value });
        else filters.others.push({ query: filter, value: value });
      }
    });
    return filters;
  }, [allFavorites, query]);

  const { statusURL, priorityURL, labelURL } = useMemo<{
    statusURL: string;
    priorityURL: string;
    labelURL: string;
  }>(
    () =>
      Object.fromEntries(
        [
          ['statusURL', ['/api/v4/alert/statuses/', 'status:']],
          ['priorityURL', ['/api/v4/alert/priorities/', 'priority:']],
          ['labelURL', ['/api/v4/alert/labels/', 'labels:']]
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
    [query]
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

  const handleFilterChange = useCallback((prefix: string, next: string, previous: Filter) => {
    setQuery(prev => {
      const q = new SimpleSearchQuery(prev.toString([]), DEFAULT_QUERY);
      if (previous) q.remove('fq', previous?.query);
      if (next) q.add('fq', `${prefix}${next}`);
      return q;
    });
  }, []);

  const handleFiltersChange = useCallback((prefix: string, next: string[], previous: Filter[]) => {
    setQuery(prev => {
      const q = new SimpleSearchQuery(prev.toString([]), DEFAULT_QUERY);

      previous
        .filter(fq => !next.includes(fq.value))
        .forEach(fq => {
          q.remove('fq', fq?.query);
        });

      const values = previous.map(p => p.value);
      next
        .filter(fq => !values.includes(fq))
        .forEach(fq => {
          q.add('fq', `${prefix}${fq}`);
        });

      return q;
    });
  }, []);

  useEffect(() => {
    if (open) setQuery(new SimpleSearchQuery(location.search, DEFAULT_QUERY));
  }, [location.search, open]);

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
                  value={status?.value}
                  totals={statusFilters}
                  url={statusURL}
                  onChange={value => handleFilterChange('status:', value, status)}
                />

                <AlertFilterInput
                  label="priority"
                  value={priority?.value}
                  totals={priorityFilters}
                  url={priorityURL}
                  onChange={value => handleFilterChange('priority:', value, priority)}
                />

                <AlertFiltersInput
                  label="labels"
                  values={labels.map(l => l.value)}
                  totals={labelFilters}
                  url={labelURL}
                  onChange={values => handleFiltersChange('label:', values, labels)}
                />

                <Favorites
                  values={favorites.map(item => item.value)}
                  onChange={values => handleFiltersChange('', values, favorites)}
                />

                <Others
                  values={others.map(item => item.value)}
                  search={buildSearchQuery({
                    search: query.getDeltaString(),
                    singles: ['q', 'tc', 'tc_start', 'no_delay'],
                    multiples: ['fq'],
                    defaultString: DEFAULT_QUERY,
                    groupByAsFilter: true
                  }).toString()}
                  onChange={values => handleFiltersChange('', values, favorites)}
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
