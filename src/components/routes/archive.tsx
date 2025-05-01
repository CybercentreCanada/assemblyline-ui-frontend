import AssignmentLateOutlinedIcon from '@mui/icons-material/AssignmentLateOutlined';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import FileOpenOutlinedIcon from '@mui/icons-material/FileOpenOutlined';
import { Chip, Grid, MenuItem, Select, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import PageContainer from 'commons/components/pages/PageContainer';
import PageFullWidth from 'commons/components/pages/PageFullWidth';
import useALContext from 'components/hooks/useALContext';
import useDrawer from 'components/hooks/useDrawer';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import type { FileIndexed } from 'components/models/base/file';
import type { FacetResult, FieldsResult, HistogramResult, SearchResult } from 'components/models/ui/search';
import ArchiveDetail from 'components/routes/archive/detail';
import { ChipList } from 'components/visual/ChipList';
import Histogram from 'components/visual/Histogram';
import LineGraph from 'components/visual/LineGraph';
import SearchBar from 'components/visual/SearchBar/search-bar';
import { DEFAULT_SUGGESTION } from 'components/visual/SearchBar/search-textfield';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import SearchPager from 'components/visual/SearchPager';
import ArchivesTable from 'components/visual/SearchResult/archives';
import SearchResultCount from 'components/visual/SearchResultCount';
import { safeFieldValue } from 'helpers/utils';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useLocation, useNavigate } from 'react-router';

const PAGE_SIZE = 25;

const DEFAULT_TC = '1m';

const TC_MAP = {
  '24h': '(archive_ts:* AND archive_ts:[now-24h TO now]) OR (NOT archive_ts:* AND seen.last:[now-24h TO now])',
  '4d': '(archive_ts:* AND archive_ts:[now-4d TO now]) OR (NOT archive_ts:* AND seen.last:[now-4d TO now])',
  '7d': '(archive_ts:* AND archive_ts:[now-7d TO now]) OR (NOT archive_ts:* AND seen.last:[now-7d TO now])',
  '1m': '(archive_ts:* AND archive_ts:[now-1M TO now]) OR (NOT archive_ts:* AND seen.last:[now-1M TO now])'
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

const DEFAULT_PARAMS: object = {
  query: '*',
  offset: 0,
  rows: PAGE_SIZE,
  archive_only: true,
  is_supplementary: false,
  tc: DEFAULT_TC,
  sort: 'archive_ts desc'
};

const DEFAULT_QUERY: string = Object.keys(DEFAULT_PARAMS)
  .map(k => `${k}=${DEFAULT_PARAMS[k]}`)
  .join('&');

export default function MalwareArchive() {
  const { t } = useTranslation(['archive']);
  const theme = useTheme();
  const location = useLocation();
  const downSM = useMediaQuery(theme.breakpoints.down('md'));

  const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  const { user: currentUser, configuration } = useALContext();
  const { showErrorMessage } = useMySnackbar();
  const { closeGlobalDrawer, setGlobalDrawer, globalDrawerOpened } = useDrawer();

  const [fileResults, setFileResults] = useState<SearchResult<FileIndexed>>(null);
  const [query, setQuery] = useState<SimpleSearchQuery>(null);
  const [parsedQuery, setParsedQuery] = useState<SimpleSearchQuery>(null);
  const [histogram, setHistogram] = useState<HistogramResult>(null);
  const [types, setTypes] = useState<Record<string, number>>(null);
  const [labels, setLabels] = useState<Record<string, number>>(null);
  const [searching, setSearching] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>();

  const filterValue = useRef<string>('');

  const hasFilter = useCallback((filter: string) => query?.getAll('filters')?.includes(filter), [query]);

  const handleToggleFilter = useCallback(
    (filter: string) => {
      if (query?.getAll('filters')?.includes(filter)) query.remove('filters', filter);
      else query.add('filters', filter);

      navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
    },
    [location.hash, location.pathname, navigate, query]
  );

  const handleClear = useCallback(() => {
    if (query?.getAll('filters').length !== 0) {
      query.delete('query');
      navigate(`${location.pathname}?${query.getDeltaString()}${location.hash ? location.hash : ''}`);
    } else {
      navigate(`${location.pathname}${location.hash ? location.hash : ''}`);
    }
  }, [location.hash, location.pathname, navigate, query]);

  const handleSearch = useCallback(() => {
    if (query.get('query') === filterValue.current) return;
    if (filterValue.current !== '') {
      query.set('query', filterValue.current);
      navigate(`${location.pathname}?${query.getDeltaString()}${location.hash ? location.hash : ''}`);
    } else {
      handleClear();
    }
  }, [query, navigate, location.pathname, location.hash, handleClear]);

  const handleFilterValueChange = useCallback((inputValue: string) => {
    filterValue.current = inputValue;
  }, []);

  const handleFileChange = useCallback(
    (file_id: string) => {
      navigate(`${location.pathname}${location.search ? location.search : ''}#${file_id}`);
    },
    [location.pathname, location.search, navigate]
  );

  const handleLabelClick = useCallback(
    (_event: React.MouseEvent<HTMLDivElement, MouseEvent>, label: string) => {
      if (!searching) {
        query.add('filters', `labels:${safeFieldValue(label)}`);
        navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
      }
    },
    [location.hash, location.pathname, navigate, query, searching]
  );

  const handleReload = useCallback(
    (q: SimpleSearchQuery) => {
      if (q && currentUser.roles.includes('archive_view')) {
        const tc = q.pop('tc') || DEFAULT_TC;
        if (tc !== '1y') {
          q.add('filters', TC_MAP[tc]);
        }

        apiCall<SearchResult<FileIndexed>>({
          url: `/api/v4/search/file/?${q.toString()}`,
          onSuccess: api_data => setFileResults(api_data.api_response),
          onFailure: api_data => showErrorMessage(api_data.api_error_message),
          onEnter: () => setSearching(true),
          onFinalize: () => setSearching(false)
        });

        apiCall<HistogramResult>({
          url: `/api/v4/search/histogram/file/seen.last/?start=${START_MAP[tc]}&end=now&gap=${
            GAP_MAP[tc]
          }&mincount=0&${q.toString(['rows', 'offset', 'sort', 'track_total_hits'])}`,
          onSuccess: api_data => setHistogram(api_data.api_response)
        });

        apiCall<FacetResult>({
          url: `/api/v4/search/facet/file/labels/?${q.toString(['rows', 'offset', 'sort', 'track_total_hits'])}`,
          onSuccess: ({ api_response }) =>
            setLabels(
              Object.fromEntries(
                Object.keys(api_response)
                  .sort((a, b) => api_response[b] - api_response[a])
                  .map(k => [k, api_response[k]])
              )
            )
        });

        apiCall<FacetResult>({
          url: `/api/v4/search/facet/file/type/?${q.toString(['rows', 'offset', 'sort', 'track_total_hits'])}`,
          onSuccess: ({ api_response }) =>
            setTypes(
              Object.fromEntries(
                Object.keys(api_response)
                  .sort((a, b) => api_response[b] - api_response[a])
                  .map(k => [k, api_response[k]])
              )
            )
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    setSearching(true);
    const newSearchQuery = new SimpleSearchQuery(location.search, DEFAULT_QUERY);
    filterValue.current = newSearchQuery.get('query');
    newSearchQuery.set('query', filterValue.current || '*');
    setQuery(newSearchQuery);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!query) return;
    const curQuery = new SimpleSearchQuery(query.toString(), DEFAULT_QUERY);
    curQuery.set('rows', PAGE_SIZE);
    curQuery.set('offset', 0);
    curQuery.set('archive_only', true);

    const supp = curQuery.pop('supplementary') || false;
    if (!supp) {
      curQuery.add('filters', 'NOT is_supplementary:true');
    }

    setParsedQuery(new SimpleSearchQuery(curQuery.toString()));
  }, [query]);

  useEffect(() => {
    if (fileResults !== null && !globalDrawerOpened && location.hash) {
      navigate(`${location.pathname}${location.search ? location.search : ''}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalDrawerOpened]);

  useEffect(() => {
    if (location.hash) {
      setGlobalDrawer(<ArchiveDetail sha256={location.hash.substr(1)} />, { hasMaximize: true });
    } else {
      closeGlobalDrawer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash]);

  useEffect(() => {
    apiCall<FieldsResult>({
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
    handleReload(parsedQuery);
  }, [handleReload, parsedQuery]);

  useEffect(() => {
    function reload() {
      handleReload(parsedQuery);
    }

    window.addEventListener('reloadArchive', reload);
    return () => {
      window.removeEventListener('reloadArchive', reload);
    };
  }, [handleReload, parsedQuery]);

  if (!configuration?.datastore?.archive?.enabled) return <Navigate to="/notfound" replace />;
  else if (!currentUser.roles.includes('archive_view')) return <Navigate to="/forbidden" replace />;
  else
    return (
      <PageFullWidth margin={4}>
        <Grid container spacing={2} style={{ paddingBottom: theme.spacing(2) }}>
          <Grid size={{ xs: 12, md: 8, xl: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing(1) }}>
              <Typography variant="h4">{t('title')}</Typography>
              <Tooltip title={t('beta.description')}>
                <div>
                  <Chip color="primary" size="small" variant="outlined" label={t('beta.title')} />
                </div>
              </Tooltip>
            </div>
          </Grid>
          <Grid size={{ xs: 12, md: 4, xl: 2 }}>
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

        <PageContainer isSticky>
          <div style={{ paddingTop: theme.spacing(1) }}>
            <SearchBar
              initValue={query && query.get('query') !== '*' ? query.get('query', '') : ''}
              placeholder={t('filter')}
              searching={searching}
              suggestions={suggestions}
              onValueChange={handleFilterValueChange}
              onClear={handleClear}
              onSearch={handleSearch}
              buttons={[
                {
                  icon: <AssignmentLateOutlinedIcon fontSize={downSM ? 'small' : 'medium'} />,
                  tooltip: hasFilter('label_categories.attribution:*')
                    ? t('filter.attributed.remove')
                    : t('filter.attributed.add'),
                  props: {
                    color: hasFilter('label_categories.attribution:*') ? 'primary' : 'default',
                    onClick: () => handleToggleFilter('label_categories.attribution:*')
                  }
                },
                {
                  icon: <ClassOutlinedIcon fontSize={downSM ? 'small' : 'medium'} />,
                  tooltip: hasFilter('labels:*') ? t('filter.labelled.remove') : t('filter.labelled.add'),
                  props: {
                    color: hasFilter('labels:*') ? 'primary' : 'default',
                    onClick: () => handleToggleFilter('labels:*')
                  }
                },
                {
                  icon: <FileOpenOutlinedIcon fontSize={downSM ? 'small' : 'medium'} />,
                  tooltip: query?.has('supplementary') ? t('supplementary.exclude') : t('supplementary.include'),
                  props: {
                    color: query?.has('supplementary') ? 'primary' : 'default',
                    onClick: () => {
                      if (query?.has('supplementary')) query.delete('supplementary');
                      else query.set('supplementary', true);

                      navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
                    }
                  }
                }
              ]}
            >
              {fileResults !== null && (
                <div
                  style={{
                    fontStyle: 'italic',
                    paddingTop: theme.spacing(0.5),
                    paddingBottom: theme.spacing(0.5),
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'flex-end'
                  }}
                >
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
                    index="file"
                    method="GET"
                    pageSize={PAGE_SIZE}
                    query={parsedQuery}
                    total={fileResults.total}
                    setResults={data => setFileResults(data as SearchResult<FileIndexed>)}
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
                      color: v.indexOf('NOT ') === 0 ? 'error' : null,
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
            <Grid size={{ xs: 12, lg: 4 }}>
              <Histogram
                dataset={histogram}
                height="200px"
                title={t(`graph.histogram.title.${query ? query.get('tc') || DEFAULT_TC : DEFAULT_TC}`)}
                datatype={t('graph.datatype')}
                isDate
                verticalLine
                onClick={(_evt, element) => {
                  if (!searching && element.length > 0) {
                    const ind = element[0].index;
                    const keys = Object.keys(histogram);
                    query.add(
                      'filters',
                      `archive_ts:[${keys[ind]} TO ${keys.length - 1 === ind ? 'now' : keys[ind + 1]}]`
                    );
                    navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <LineGraph
                dataset={labels}
                height="200px"
                title={t('graph.labels.title')}
                datatype={t('graph.datatype')}
                onClick={(_evt, element) => {
                  if (!searching && element.length > 0) {
                    const ind = element[0].index;
                    query.add('filters', `labels:${safeFieldValue(Object.keys(labels)[ind])}`);
                    navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <LineGraph
                dataset={types}
                height="200px"
                title={t('graph.type.title')}
                datatype={t('graph.datatype')}
                onClick={(_evt, element) => {
                  if (!searching && element.length > 0) {
                    const ind = element[0].index;
                    query.add('filters', `type:${safeFieldValue(Object.keys(types)[ind])}`);
                    navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
                  }
                }}
              />
            </Grid>
          </Grid>
        )}

        <div
          style={{
            paddingTop: theme.spacing(2),
            paddingLeft: theme.spacing(0.5),
            paddingRight: theme.spacing(0.5)
          }}
        >
          <ArchivesTable fileResults={fileResults} setFileID={handleFileChange} onLabelClick={handleLabelClick} />
        </div>
      </PageFullWidth>
    );
}
