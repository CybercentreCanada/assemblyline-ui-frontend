import { Grid, MenuItem, Select, Typography, useTheme } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import makeStyles from '@mui/styles/makeStyles';
import PageFullWidth from 'commons/components/pages/PageFullWidth';
import PageHeader from 'commons/components/pages/PageHeader';
import useALContext from 'components/hooks/useALContext';
import useDrawer from 'components/hooks/useDrawer';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { ChipList } from 'components/visual/ChipList';
import FileDetail from 'components/visual/FileDetail';
import Histogram from 'components/visual/Histogram';
import LineGraph from 'components/visual/LineGraph';
import SearchBar from 'components/visual/SearchBar/search-bar';
import { DEFAULT_SUGGESTION } from 'components/visual/SearchBar/search-textfield';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import SearchPager from 'components/visual/SearchPager';
import { ArchivedFileResult, ArchivesTable2 } from 'components/visual/SearchResult/archives2';
import SearchResultCount from 'components/visual/SearchResultCount';
import { safeFieldValue } from 'helpers/utils';
import 'moment/locale/fr';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';

const PAGE_SIZE = 25;

const useStyles = makeStyles(theme => ({
  searchresult: {
    fontStyle: 'italic',
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-end'
  },
  drawerPaper: {
    width: '80%',
    maxWidth: '800px',
    [theme.breakpoints.down('xl')]: {
      width: '100%'
    }
  }
}));

type FileResults = {
  items: ArchivedFileResult[];
  offset: number;
  rows: number;
  total: number;
};

const DEFAULT_QUERY = '*';

const DEFAULT_TC = '1m';

const TC_MAP = {
  '24h': 'seen.last:[now-24h TO now]',
  '4d': 'seen.last:[now-4d TO now]',
  '7d': 'seen.last:[now-7d TO now]',
  '1m': 'seen.last:[now-1M TO now]'
};

const START_MAP = {
  '24h': 'now-1d',
  '4d': 'now-4d',
  '7d': 'now-7d',
  '1m': 'now-1M',
  '1y': 'now-1y'
};

const GAP_MAP = {
  '24h': '1h',
  '4d': '2h',
  '7d': '4h',
  '1m': '1d',
  '1y': '15d'
};

export default function MalwareArchive() {
  const { t } = useTranslation(['archive']);
  const theme = useTheme();
  const classes = useStyles();
  const location = useLocation();

  const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  const { user: currentUser, configuration } = useALContext();
  const { showErrorMessage } = useMySnackbar();
  const { closeGlobalDrawer, setGlobalDrawer, globalDrawerOpened } = useDrawer();

  const [fileResults, setFileResults] = useState<FileResults>(null);
  const [query, setQuery] = useState<SimpleSearchQuery>(null);
  const [histogram, setHistogram] = useState(null);
  const [types, setTypes] = useState<{ [k: string]: number }>(null);
  const [labels, setLabels] = useState<{ [k: string]: number }>(null);
  const [pageSize] = useState<number>(PAGE_SIZE);
  const [searching, setSearching] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>();

  const filterValue = useRef<string>('');

  const onClear = useCallback(() => {
    if (query.getAll('filters').length !== 0) {
      query.delete('query');
      navigate(`${location.pathname}?${query.getDeltaString()}${location.hash ? location.hash : ''}`);
    } else {
      navigate(`${location.pathname}${location.hash ? location.hash : ''}`);
    }
  }, [location.hash, location.pathname, navigate, query]);

  const onSearch = useCallback(() => {
    if (query.get('query') === filterValue.current) return;
    if (filterValue.current !== '') {
      query.set('query', filterValue.current);
      navigate(`${location.pathname}?${query.getDeltaString()}${location.hash ? location.hash : ''}`);
    } else {
      onClear();
    }
  }, [query, navigate, location.pathname, location.hash, onClear]);

  const onFilterValueChange = useCallback((inputValue: string) => {
    filterValue.current = inputValue;
  }, []);

  const setFileID = useCallback(
    (file_id: string) => {
      navigate(`${location.pathname}${location.search ? location.search : ''}#${file_id}`);
    },
    [location.pathname, location.search, navigate]
  );

  const onLabelClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>, label: string) => {
      if (!searching) {
        query.add('filters', `labels:${label}`);
        navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
      }
    },
    [location.hash, location.pathname, navigate, query, searching]
  );

  useEffect(() => {
    setSearching(true);
    const newSearchQuery = new SimpleSearchQuery(
      location.search,
      `query=${DEFAULT_QUERY}&rows=${pageSize}&offset=0&tc=${DEFAULT_TC}`
    );
    filterValue.current = newSearchQuery.get('query');
    setQuery(newSearchQuery);
  }, [location.pathname, location.search, pageSize]);

  useEffect(() => {
    if (fileResults !== null && !globalDrawerOpened && location.hash) {
      navigate(`${location.pathname}${location.search ? location.search : ''}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalDrawerOpened]);

  useEffect(() => {
    if (location.hash) {
      setGlobalDrawer(<FileDetail sha256={location.hash.substr(1)} />);
    } else {
      closeGlobalDrawer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash]);

  useEffect(() => {
    apiCall({
      url: '/api/v4/search/fields/file/',
      onSuccess: api_data => {
        setSuggestions([
          ...Object.keys(api_data.api_response).filter(name => api_data.api_response[name].indexed),
          ...DEFAULT_SUGGESTION
        ]);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (query && currentUser.is_admin) {
      const curQuery = new SimpleSearchQuery(query.toString(), `query=${DEFAULT_QUERY}&rows=${pageSize}&offset=0`);
      curQuery.set('rows', pageSize);
      curQuery.set('offset', 0);
      curQuery.set('archive_only', true);
      const tc = curQuery.pop('tc') || DEFAULT_TC;
      if (tc !== '1y') {
        curQuery.add('filters', TC_MAP[tc]);
      }

      setSearching(true);
      apiCall({
        method: 'POST',
        url: `/api/v4/search/file/`,
        body: curQuery.getParams(),
        onSuccess: api_data => {
          setFileResults(api_data.api_response);
        },
        onFailure: api_data => {
          showErrorMessage(api_data.api_error_message);
        },
        onFinalize: () => {
          setSearching(false);
        }
      });
      apiCall({
        url: `/api/v4/search/histogram/file/seen.last/?start=${START_MAP[tc]}&end=now&gap=${
          GAP_MAP[tc]
        }&mincount=0&${query.toString(['rows', 'offset', 'sort', 'track_total_hits', 'archive_only'])}`,
        onSuccess: api_data => {
          setHistogram(api_data.api_response);
        }
      });
      apiCall({
        url: `/api/v4/search/facet/file/labels/?${curQuery.toString([
          'rows',
          'offset',
          'sort',
          'track_total_hits',
          'archive_only'
        ])}`,
        onSuccess: api_data => {
          let newLabels: { [k: string]: number } = api_data.api_response;
          newLabels = Object.fromEntries(
            Object.keys(newLabels)
              .sort((a, b) => newLabels[b] - newLabels[a])
              .map(k => [k, newLabels[k]])
          );
          setLabels(newLabels);
        }
      });
      apiCall({
        url: `/api/v4/search/facet/file/type/?${curQuery.toString([
          'rows',
          'offset',
          'sort',
          'track_total_hits',
          'archive_only'
        ])}`,
        onSuccess: api_data => {
          let newTypes: { [k: string]: number } = api_data.api_response;
          newTypes = Object.fromEntries(
            Object.keys(newTypes)
              .sort((a, b) => newTypes[b] - newTypes[a])
              .map(k => [k, newTypes[k]])
          );
          setTypes(newTypes);
        }
      });
    }
    // eslint-disable-next-line
  }, [query]);

  if (!configuration?.datastore?.archive?.enabled) return <Navigate to="/notfound" replace />;
  else if (!currentUser.is_admin) return <Navigate to="/forbidden" replace />;
  else
    return (
      <PageFullWidth margin={4}>
        <Grid container spacing={2} style={{ paddingBottom: theme.spacing(2) }}>
          <Grid item xs={12} sm={7} md={9} xl={10}>
            <Typography variant="h4">{t('title')}</Typography>
          </Grid>
          <Grid item xs={12} sm={5} md={3} xl={2}>
            <FormControl size="small" fullWidth>
              <Select
                disabled={searching}
                value={query ? query.get('tc') || DEFAULT_TC : DEFAULT_TC}
                variant="outlined"
                onChange={event => {
                  query.set('tc', event.target.value);
                  navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
                }}
                fullWidth
              >
                <MenuItem value="24h">{t('tc.24h')}</MenuItem>
                <MenuItem value="4d">{t('tc.4d')}</MenuItem>
                <MenuItem value="7d">{t('tc.7d')}</MenuItem>
                <MenuItem value="1m">{t('tc.1m')}</MenuItem>
                <MenuItem value="1y">{t('tc.1y')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <PageHeader isSticky>
          <div style={{ paddingTop: theme.spacing(1) }}>
            <SearchBar
              initValue={query ? query.get('query', '') : ''}
              placeholder={t('filter')}
              searching={searching}
              suggestions={suggestions}
              onValueChange={onFilterValueChange}
              onClear={onClear}
              onSearch={onSearch}
            >
              {fileResults !== null && (
                <div className={classes.searchresult}>
                  {fileResults.total !== 0 && (
                    <Typography variant="subtitle1" color="secondary" style={{ flexGrow: 1 }}>
                      {searching ? (
                        <span>{t('searching')}</span>
                      ) : (
                        <span>
                          <SearchResultCount count={fileResults.total} />
                          {query.get('query')
                            ? t(`filtered${fileResults.total === 1 ? '' : 's'}`)
                            : t(`total${fileResults.total === 1 ? '' : 's'}`)}
                        </span>
                      )}
                    </Typography>
                  )}

                  <SearchPager
                    total={fileResults.total}
                    setResults={setFileResults}
                    pageSize={pageSize}
                    index="file"
                    query={query}
                    setSearching={setSearching}
                  />
                </div>
              )}

              {query && (
                <div>
                  <ChipList
                    items={query.getAll('filters', []).map(v => ({
                      variant: 'outlined',
                      label: `${v}`,
                      color: v.indexOf('NOT ') === 0 ? 'file' : null,
                      onClick: () => {
                        query.replace(
                          'filters',
                          v,
                          v.indexOf('NOT ') === 0 ? v.substring(5, v.length - 1) : `NOT (${v})`
                        );
                        navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
                      },
                      onDelete: () => {
                        query.remove('filters', v);
                        navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
                      }
                    }))}
                  />
                </div>
              )}
            </SearchBar>
          </div>
        </PageHeader>

        {fileResults !== null && fileResults.total !== 0 && (
          <Grid container spacing={2}>
            <Grid item xs={12} lg={4}>
              <Histogram
                dataset={histogram}
                height="200px"
                title={t(`graph.histogram.title.${query ? query.get('tc') || DEFAULT_TC : DEFAULT_TC}`)}
                datatype={t('graph.datatype')}
                isDate
                verticalLine
                onClick={(evt, element) => {
                  if (!searching && element.length > 0) {
                    const ind = element[0].index;
                    const keys = Object.keys(histogram);
                    query.add(
                      'filters',
                      `seen.last:[${keys[ind]} TO ${keys.length - 1 === ind ? 'now' : keys[ind + 1]}]`
                    );
                    navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <LineGraph
                dataset={labels}
                height="200px"
                title={t('graph.labels.title')}
                datatype={t('graph.datatype')}
                onClick={(evt, element) => {
                  if (!searching && element.length > 0) {
                    var ind = element[0].index;
                    query.add('filters', `labels:${Object.keys(labels)[ind]}`);
                    navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <LineGraph
                dataset={types}
                height="200px"
                title={t('graph.type.title')}
                datatype={t('graph.datatype')}
                onClick={(evt, element) => {
                  if (!searching && element.length > 0) {
                    var ind = element[0].index;
                    query.add('filters', `type:${safeFieldValue(Object.keys(types)[ind])}`);
                    navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
                  }
                }}
              />
            </Grid>
          </Grid>
        )}

        {/* <div style={{ paddingTop: theme.spacing(2), paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
        <ArchivesTable fileResults={fileResults} setFileID={setFileID} />
      </div> */}
        <div
          style={{ paddingTop: theme.spacing(2), paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}
        >
          <ArchivesTable2 fileResults={fileResults} setFileID={setFileID} onLabelClick={onLabelClick} />
        </div>
      </PageFullWidth>
    );
}
