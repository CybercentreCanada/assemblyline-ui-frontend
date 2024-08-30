import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PanToolOutlinedIcon from '@mui/icons-material/PanToolOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import { Grid, MenuItem, Select, Typography, useTheme } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageFullWidth from 'commons/components/pages/PageFullWidth';
import PageHeader from 'commons/components/pages/PageHeader';
import useDrawer from 'components/hooks/useDrawer';
import useMyAPI from 'components/hooks/useMyAPI';
import type { CustomUser } from 'components/hooks/useMyUser';
import Histogram from 'components/visual/Histogram';
import LineGraph from 'components/visual/LineGraph';
import SearchHeader from 'components/visual/SearchBar/SearchHeader';
import type { SearchParams } from 'components/visual/SearchBar/SearchParams2';
import { SearchParamsProvider, useSearchParams } from 'components/visual/SearchBar/SearchParamsContext2';
import { DEFAULT_SUGGESTION } from 'components/visual/SearchBar/search-textfield';
import ErrorsTable, { ErrorResult } from 'components/visual/SearchResult/errors';
import { safeFieldValue } from 'helpers/utils';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
import { ErrorDetail } from './error_detail';

// const PAGE_SIZE = 25;

// const useStyles = makeStyles(theme => ({
//   searchresult: {
//     fontStyle: 'italic',
//     paddingTop: theme.spacing(0.5),
//     paddingBottom: theme.spacing(0.5),
//     display: 'flex',
//     flexWrap: 'wrap',
//     justifyContent: 'flex-end'
//   },
//   drawerPaper: {
//     width: '80%',
//     maxWidth: '800px',
//     [theme.breakpoints.down('xl')]: {
//       width: '100%'
//     }
//   }
// }));

type SearchResults = {
  items: ErrorResult[];
  offset: number;
  rows: number;
  total: number;
};

const TIME_CONTRAINTS = ['24h', '4d', '7d', '1m', '1y'] as const;

type TimeContraint = (typeof TIME_CONTRAINTS)[number];

const TC_MAP: Record<TimeContraint, string> = {
  '24h': 'created:[now-24h TO now]',
  '4d': 'created:[now-4d TO now]',
  '7d': 'created:[now-7d TO now]',
  '1m': 'created:[now-1M TO now]',
  '1y': null
};

const START_MAP: Record<TimeContraint, string> = {
  '24h': 'now-1d',
  '4d': 'now-4d',
  '7d': 'now-7d',
  '1m': 'now-1M',
  '1y': 'now-1y'
};

const GAP_MAP: Record<TimeContraint, string> = {
  '24h': '1h',
  '4d': '2h',
  '7d': '4h',
  '1m': '1d',
  '1y': '15d'
};

// const DEFAULT_TC: TimeContraint = '4d';

const ERROR_VIEWER_PARAMS = {
  query: '',
  offset: 0,
  rows: 25,
  sort: 'created desc',
  tc: '4d',
  filters: [],
  track_total_hits: 10000,
  mincount: 0,
  use_archive: false,
  archive_only: false
};

type ErrorViewerParams = SearchParams<typeof ERROR_VIEWER_PARAMS>;

const ErrorViewer = () => {
  const { t } = useTranslation(['adminErrorViewer']);
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  const { user: currentUser } = useAppUser<CustomUser>();
  const { globalDrawerOpened, setGlobalDrawer, closeGlobalDrawer } = useDrawer();
  const { search, setSearchParams, setSearchObject } = useSearchParams<ErrorViewerParams>();

  const [errorResults, setErrorResults] = useState<SearchResults>(null);
  const [histogram, setHistogram] = useState<{ [s: string]: number }>(null);
  const [types, setTypes] = useState<{ [s: string]: number }>(null);
  const [names, setNames] = useState<{ [s: string]: number }>(null);
  const [searching, setSearching] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTION);

  const setErrorKey = useCallback(
    (error_key: string) => navigate(`${location.pathname}${location.search || ''}#${error_key}`),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [location.search]
  );

  // const handleReload = useCallback(
  //   (params: string) => {
  //     if (!params || !currentUser.is_admin) return;

  //     apiCall({
  //       url: `/api/v4/error/list/?${params}`,
  //       method: 'GET',
  //       onSuccess: ({ api_response }) => setErrorResults(api_response as SearchResults),
  //       onEnter: () => setSearching(true),
  //       onExit: () => setSearching(false)
  //     });

  //     apiCall({
  //       url: `/api/v4/search/facet/error/response.service_name/?${curQuery.toString([
  //         'rows',
  //         'offset',
  //         'sort',
  //         'track_total_hits'
  //       ])}`,
  //       onSuccess: api_data => {
  //         setNames(api_data.api_response);
  //       }
  //     });

  //     apiCall({
  //       url: `/api/v4/search/facet/error/type/?${curQuery.toString(['rows', 'offset', 'sort', 'track_total_hits'])}`,
  //       onSuccess: api_data => {
  //         setTypes(api_data.api_response);
  //       }
  //     });

  //     apiCall({
  //       url: `/api/v4/search/histogram/error/created/?start=${START_MAP[tc]}&end=now&gap=${
  //         GAP_MAP[tc]
  //       }&mincount=0&${curQuery.toString(['rows', 'offset', 'sort', 'track_total_hits'])}`,
  //       onSuccess: api_data => {
  //         setHistogram(api_data.api_response);
  //       }
  //     });
  //   },
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [currentUser.is_admin]
  // );

  useEffect(() => {
    if (!search || !currentUser.is_admin) return;

    const body = search.set(o => ({ ...o, query: o.query || '*', tc:  }));

    apiCall({
      url: `/api/v4/error/list/?${body.toString()}`,
      onSuccess: ({ api_response }) => setErrorResults(api_response as SearchResults),
      onEnter: () => setSearching(true),
      onExit: () => setSearching(false)
    });

    apiCall({
      url: '/api/v4/search/facet/error/type/',
      method: 'POST',
      body: body
        .filter(key => ['query', 'mincount', 'filters', 'timeout', 'use_archive', 'archive_only'].includes(key))
        .toObject(),
      onSuccess: ({ api_response }) => setTypes(api_response as { [s: string]: number })
    });

    // const tc = (curQuery.pop('tc') as TimeContraint) || DEFAULT_TC;
    // if (tc in GAP_MAP && tc !== '1y') curQuery.add('filters', TC_MAP[tc]);
    // apiCall({
    //   url: `/api/v4/search/facet/error/response.service_name/?${curQuery.toString([
    //     'rows',
    //     'offset',
    //     'sort',
    //     'track_total_hits'
    //   ])}`,
    //   onSuccess: api_data => {
    //     setNames(api_data.api_response);
    //   }
    // });

    // apiCall({
    //   url: `/api/v4/search/histogram/error/created/?start=${START_MAP[tc]}&end=now&gap=${
    //     GAP_MAP[tc]
    //   }&mincount=0&${curQuery.toString(['rows', 'offset', 'sort', 'track_total_hits'])}`,
    //   onSuccess: api_data => {
    //     setHistogram(api_data.api_response);
    //   }
    // });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.is_admin, search]);

  // const parsedQuery = useMemo<SimpleSearchQuery>(() => {
  //   if (!query || !currentUser.is_admin) return null;

  //   const curQuery = new SimpleSearchQuery(query.toString(), `rows=${pageSize}&offset=0&tc=${DEFAULT_TC}`);
  //   curQuery.set('rows', pageSize);
  //   curQuery.set('offset', 0);
  //   const tc = (curQuery.pop('tc') as TimeContraint) || DEFAULT_TC;
  //   if (tc in GAP_MAP && tc !== '1y') curQuery.add('filters', TC_MAP[tc]);

  //   return curQuery;
  // }, [currentUser.is_admin, pageSize, query]);

  // useEffect(() => {
  //   setQuery(new SimpleSearchQuery(location.search, `rows=${pageSize}&offset=0&tc=${DEFAULT_TC}`));
  // }, [location.pathname, location.search, pageSize]);

  // useEffect(() => {
  //   if (errorResults !== null && !globalDrawerOpened && location.hash) {
  //     navigate(`${location.pathname}${location.search ? location.search : ''}`);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [globalDrawerOpened]);

  // useEffect(() => {
  //   if (location.hash) {
  //     setGlobalDrawer(<ErrorDetail error_key={location.hash.substr(1)} />);
  //   } else {
  //     closeGlobalDrawer();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [location.hash]);

  // useEffect(() => {
  //   if (!parsedQuery) return;
  //   apiCall({
  //     url: `/api/v4/error/list/?${parsedQuery.toString()}`,
  //     onSuccess: api_data => setErrorResults(api_data.api_response),
  //     onEnter: () => setSearching(true),
  //     onExit: () => setSearching(false)
  //   });
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [parsedQuery]);

  // useEffect(() => {
  //   if (!query) return;
  //   const curQuery = new SimpleSearchQuery(query.toString(), `rows=${pageSize}&offset=0&tc=${DEFAULT_TC}`);
  //   curQuery.set('rows', pageSize);
  //   curQuery.set('offset', 0);

  //   const tc = (curQuery.pop('tc') as TimeContraint) || DEFAULT_TC;
  //   if (tc in GAP_MAP && tc !== '1y') curQuery.add('filters', TC_MAP[tc]);
  //   apiCall({
  //     url: `/api/v4/search/facet/error/response.service_name/?${curQuery.toString([
  //       'rows',
  //       'offset',
  //       'sort',
  //       'track_total_hits'
  //     ])}`,
  //     onSuccess: api_data => {
  //       setNames(api_data.api_response);
  //     }
  //   });
  //   apiCall({
  //     url: `/api/v4/search/facet/error/type/?${curQuery.toString(['rows', 'offset', 'sort', 'track_total_hits'])}`,
  //     onSuccess: api_data => {
  //       setTypes(api_data.api_response);
  //     }
  //   });
  //   apiCall({
  //     url: `/api/v4/search/histogram/error/created/?start=${START_MAP[tc]}&end=now&gap=${
  //       GAP_MAP[tc]
  //     }&mincount=0&${curQuery.toString(['rows', 'offset', 'sort', 'track_total_hits'])}`,
  //     onSuccess: api_data => {
  //       setHistogram(api_data.api_response);
  //     }
  //   });
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [pageSize, query]);

  // useEffect(() => {
  //   apiCall({
  //     url: '/api/v4/search/fields/error/',
  //     onSuccess: api_data => {
  //       setSuggestions([
  //         ...Object.keys(api_data.api_response).filter(name => api_data.api_response[name].indexed),
  //         ...DEFAULT_SUGGESTION
  //       ]);
  //     }
  //   });
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // const onClear = useCallback(
  //   () => {
  //     if (query.getAll('filters').length !== 0) {
  //       query.delete('query');
  //       navigate(`${location.pathname}?${query.getDeltaString()}`);
  //     } else {
  //       navigate(location.pathname);
  //     }
  //   },
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [location.pathname, query]
  // );

  // const onSearch = useCallback(
  //   () => {
  //     if (filterValue.current !== '') {
  //       query.set('query', filterValue.current);
  //       navigate(`${location.pathname}?${query.getDeltaString()}`);
  //     } else {
  //       onClear();
  //     }
  //   },
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [query, location.pathname, onClear]
  // );

  // const onFilterValueChange = useCallback((inputValue: string) => {
  //   filterValue.current = inputValue;
  // }, []);

  useEffect(() => {
    apiCall({
      url: '/api/v4/search/fields/error/',
      onSuccess: api_data => {
        const values = Object.keys(api_data.api_response).filter(name => api_data.api_response[name].indexed);
        setSuggestions([...values, ...DEFAULT_SUGGESTION]);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!location.hash || globalDrawerOpened || !errorResults) return;
    navigate(`${location.pathname}${location.search || ''}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalDrawerOpened]);

  useEffect(() => {
    if (location.hash) setGlobalDrawer(<ErrorDetail error_key={location.hash.substr(1)} />);
    else closeGlobalDrawer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash]);

  // useEffect(() => {
  //   handleReload(search.set(o => ({ ...o, query: o.query || '*' })).toString());
  // }, [handleReload, search]);

  return currentUser.is_admin ? (
    <PageFullWidth margin={4}>
      <Grid container spacing={2} style={{ paddingBottom: theme.spacing(2) }}>
        <Grid item xs={12} sm={7} md={9} xl={10}>
          <Typography variant="h4">{t('title')}</Typography>
        </Grid>
        <Grid item xs={12} sm={5} md={3} xl={2}>
          <FormControl size="small" fullWidth>
            <Select
              disabled={searching}
              // value={query ? query.get('tc') || DEFAULT_TC : DEFAULT_TC}
              value={search.get('tc')}
              variant="outlined"
              onChange={event => setSearchObject(o => ({ ...o, tc: event.target.value }))}
              fullWidth
            >
              {TIME_CONTRAINTS.map((time, i) => (
                <MenuItem key={i} value={time} children={t(`tc.${time}`)} />
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <PageHeader isSticky>
        <div style={{ paddingTop: theme.spacing(1) }}>
          <SearchHeader
            params={search.toParams()}
            loading={searching}
            results={errorResults}
            resultLabel={
              search.get('query')
                ? t(`filtered${errorResults?.total === 1 ? '' : 's'}`)
                : t(`total${errorResults?.total === 1 ? '' : 's'}`)
            }
            onChange={v => setSearchParams(v)}
            searchInputProps={{ placeholder: t('filter'), options: suggestions }}
            actionProps={[
              {
                tooltip: { title: t('exception') },
                icon: { children: <ReportProblemOutlinedIcon /> },
                button: {
                  onClick: () =>
                    setSearchObject(o => ({ ...o, filters: [...o.filters, 'type:(EXCEPTION OR UNKNOWN)'] }))
                }
              },
              {
                tooltip: { title: t('canceled') },
                icon: { children: <CancelOutlinedIcon /> },
                button: {
                  onClick: () => setSearchObject(o => ({ ...o, filters: [...o.filters, 'type:(SERVICE* OR TASK*)'] }))
                }
              },
              {
                tooltip: { title: t('maxed') },
                icon: { children: <PanToolOutlinedIcon /> },
                button: {
                  onClick: () => setSearchObject(o => ({ ...o, filters: [...o.filters, 'type:MAX*'] }))
                }
              }
            ]}
          />
        </div>
      </PageHeader>

      {/* <PageHeader isSticky>
        <div style={{ paddingTop: theme.spacing(1) }}>
          <SearchBar
            initValue={query ? query.get('query', '') : ''}
            placeholder={t('filter')}
            searching={searching}
            suggestions={suggestions}
            onValueChange={onFilterValueChange}
            onClear={onClear}
            onSearch={onSearch}
            buttons={[
              {
                icon: <ReportProblemOutlinedIcon fontSize={upMD ? 'medium' : 'small'} />,
                tooltip: t('exception'),
                props: {
                  onClick: () => {
                    query.set('query', 'type:(EXCEPTION OR UNKNOWN)');
                    navigate(`${location.pathname}?${query.getDeltaString()}`);
                  }
                }
              },
              {
                icon: <CancelOutlinedIcon fontSize={upMD ? 'medium' : 'small'} />,
                tooltip: t('canceled'),
                props: {
                  onClick: () => {
                    query.set('query', 'type:(SERVICE* OR TASK*)');
                    navigate(`${location.pathname}?${query.getDeltaString()}`);
                  }
                }
              },
              {
                icon: <PanToolOutlinedIcon fontSize={upMD ? 'medium' : 'small'} />,
                tooltip: t('maxed'),
                props: {
                  onClick: () => {
                    query.set('query', 'type:MAX*');
                    navigate(`${location.pathname}?${query.getDeltaString()}`);
                  }
                }
              }
            ]}
          >
            {errorResults !== null && (
              <div className={classes.searchresult}>
                {errorResults.total !== 0 && (
                  <Typography variant="subtitle1" color="secondary" style={{ flexGrow: 1 }}>
                    {searching ? (
                      <span>{t('searching')}</span>
                    ) : (
                      <span>
                        <SearchResultCount count={errorResults.total} />
                        {query.get('query')
                          ? t(`filtered${errorResults.total === 1 ? '' : 's'}`)
                          : t(`total${errorResults.total === 1 ? '' : 's'}`)}
                      </span>
                    )}
                  </Typography>
                )}

                <SearchPager
                  query={parsedQuery}
                  pageSize={pageSize}
                  total={errorResults.total}
                  index={null}
                  url="/api/v4/error/list/"
                  method="GET"
                  setResults={setErrorResults}
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
                      navigate(`${location.pathname}?${query.getDeltaString()}`);
                    },
                    onDelete: () => {
                      query.remove('filters', v);
                      navigate(`${location.pathname}?${query.getDeltaString()}`);
                    }
                  }))}
                />
              </div>
            )}
          </SearchBar>
        </div>
      </PageHeader> */}

      {errorResults !== null && errorResults.total !== 0 && (
        <Grid container spacing={2}>
          <Grid item xs={12} lg={4}>
            <Histogram
              dataset={histogram}
              height="200px"
              // title={t(`graph.histogram.title.${query ? query.get('tc') || DEFAULT_TC : DEFAULT_TC}`)}
              title={t(`graph.histogram.title.${search.get('tc')}`)}
              datatype={t('graph.datatype')}
              isDate
              verticalLine
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <LineGraph
              dataset={names}
              height="200px"
              title={t('graph.name.title')}
              datatype={t('graph.datatype')}
              onClick={(evt, element) => {
                if (!searching && element.length > 0) {
                  const filter = `response.service_name:${Object.keys(names)[element[0].index]}`;
                  setSearchObject(o => ({ ...o, filters: [...o.filters, filter] }));
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
                  const filter = `type:${safeFieldValue(Object.keys(types)[element[0].index])}`;
                  setSearchObject(o => ({ ...o, filters: [...o.filters, filter] }));
                }
              }}
            />
          </Grid>
        </Grid>
      )}

      <div style={{ paddingTop: theme.spacing(2), paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
        <ErrorsTable errorResults={errorResults} setErrorKey={setErrorKey} />
      </div>
    </PageFullWidth>
  ) : (
    <Navigate to="/forbidden" replace />
  );
};

const WrappedErrorViewerPage = () => (
  <SearchParamsProvider defaultValue={ERROR_VIEWER_PARAMS} hidden={['rows', 'offset']} enforced={['rows']}>
    <ErrorViewer />
  </SearchParamsProvider>
);

export const ErrorViewerPage = React.memo(WrappedErrorViewerPage);
export default ErrorViewerPage;
