import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';
import {
  Autocomplete,
  Button,
  Drawer,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
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
  }
}));

export type Option = { value: string; label: string };

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
  value: string;
  count: number;
  total: number;
};

type AlertFilterInputProps = {
  label: string;
  values: string[];
  totals: { [key: string]: number };
  url: string;
  onChange: (values: string[]) => void;
};

const AlertFilterInput: React.FC<AlertFilterInputProps> = React.memo(
  ({ label = '', values = [], totals = null, url = '', onChange = () => null }: AlertFilterInputProps) => {
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

    const fetchOptions = useCallback(
      () => {
        apiCall({
          url: url,
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
      [url]
    );

    return (
      <div style={{ marginBottom: theme.spacing(2) }}>
        <label>{t(label)}</label>
        <Autocomplete
          classes={{ listbox: classes.listbox, option: classes.option }}
          value={values.map(v => ({ value: v, count: 0, total: 0 }))}
          onChange={(event, items) => onChange(items.map(i => i.value))}
          onOpen={() => prevURL.current !== url && fetchOptions()}
          inputValue={inputValue}
          onInputChange={(event, value) => setInputValue(value)}
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
            <li {...props} key={JSON.stringify(item)}>
              <div>
                <CustomChip
                  label={
                    <>
                      <span style={{ color: theme.palette.text.primary }}>{`${item.count} `}</span>
                      <span style={{ color: theme.palette.text.secondary }}>{`/ ${item.total}`}</span>
                    </>
                  }
                  size="small"
                />
              </div>
              <div>
                <Typography
                  color={item.count > 0 ? theme.palette.text.primary : theme.palette.text.disabled}
                  style={{ wordBreak: 'break-all' }}
                  children={item.value}
                />
              </div>
            </li>
          )}
        />
      </div>
    );
  }
);

type FavoritesProps = {
  values: string[];
  onChange: (values: string[], favorites: string[]) => void;
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
        onChange={(event, value) =>
          onChange(
            value.map(item => item.query),
            options.map(option => option.query)
          )
        }
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
                <Typography color={theme.palette.text.disabled} noWrap children={`(${item.created_by})`} />
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
          <li {...props} key={JSON.stringify(item)}>
            <div>
              <CustomChip
                label={
                  <>
                    <span style={{ color: theme.palette.text.primary }}>{`${item.count} `}</span>
                  </>
                }
                size="small"
              />
            </div>
            <div>
              <Typography
                color={item.count > 0 ? theme.palette.text.primary : theme.palette.text.disabled}
                style={{ wordBreak: 'break-all' }}
                children={item.value}
              />
            </div>
          </li>
        )}
      />
    </div>
  );
});

const WrappedAlertFilters = () => {
  const { t } = useTranslation('alerts');
  const classes = useStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const { statusFilters, priorityFilters, labelFilters } = useAlerts();

  const isMDUp = useMediaQuery(theme.breakpoints.up('md'));

  const [query, setQuery] = useState(new SimpleSearchQuery(location.search, DEFAULT_QUERY));
  const [open, setOpen] = useState<boolean>(false);
  const [render, setRender] = useState<boolean>(false);

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

  const getParsedFilter = useCallback((search: SimpleSearchQuery, prefix: string): string[] => {
    const item: string = search.getAll('fq', []).find((i: string) => i.startsWith(prefix));
    return !item
      ? []
      : item
          .replace(`${prefix}(`, '')
          .slice(0, -1)
          .split(/\sor\s|\sOR\s/)
          .filter((v: string) => v && v !== '')
          .map((v: string) => v);
  }, []);

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

  const handleFilterChange = useCallback((key: string, values: string[]) => {
    setQuery(prev => {
      const q = new SimpleSearchQuery(prev.toString([]), DEFAULT_QUERY);

      q.getAll('fq', [])
        .filter(f => f.startsWith(key))
        .forEach(item => {
          q.remove('fq', item);
        });

      if (values.length > 0) q.add('fq', `${key}(${values.join(' OR ')})`);

      return q;
    });
  }, []);

  const handleOptionChange = useCallback((values: string[], options: string[]) => {
    setQuery(prev => {
      const q = new SimpleSearchQuery(prev.toString([]), DEFAULT_QUERY);

      q.getAll('fq', [])
        .filter(f => options.includes(f))
        .forEach(item => {
          q.remove('fq', item);
        });

      values.forEach(value => {
        q.add('fq', value);
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
                  values={getParsedFilter(query, 'status:')}
                  totals={statusFilters}
                  url={statusURL}
                  onChange={values => handleFilterChange('status:', values)}
                />

                <AlertFilterInput
                  label="priority"
                  values={getParsedFilter(query, 'priority:')}
                  totals={priorityFilters}
                  url={priorityURL}
                  onChange={values => handleFilterChange('priority:', values)}
                />

                <AlertFilterInput
                  label="labels"
                  values={getParsedFilter(query, 'label:')}
                  totals={labelFilters}
                  url={labelURL}
                  onChange={values => handleFilterChange('label:', values)}
                />

                <Favorites
                  values={query.getAll('fq')}
                  onChange={(values, options) => handleOptionChange(values, options)}
                />

                <Others
                  values={query.getAll('fq')}
                  search={buildSearchQuery({
                    search: query.getDeltaString(),
                    singles: ['q', 'tc', 'tc_start', 'no_delay'],
                    multiples: ['fq'],
                    defaultString: DEFAULT_QUERY,
                    groupByAsFilter: true
                  }).toString()}
                  onChange={(values, options) => handleOptionChange(values, options)}
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
