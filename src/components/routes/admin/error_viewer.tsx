import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PanToolOutlinedIcon from '@mui/icons-material/PanToolOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import { Grid, MenuItem, Select, Typography, useTheme } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import { useAppUser } from 'commons/components/app/hooks';
import PageFullWidth from 'commons/components/pages/PageFullWidth';
import PageHeader from 'commons/components/pages/PageHeader';
import type { SearchParams } from 'components/core/SearchParams/SearchParams';
import { createSearchParams } from 'components/core/SearchParams/SearchParams';
import { SearchParamsProvider, useSearchParams } from 'components/core/SearchParams/SearchParamsContext';
import useDrawer from 'components/hooks/useDrawer';
import useMyAPI from 'components/hooks/useMyAPI';
import type { Error } from 'components/models/base/error';
import type { FacetResult, HistogramResult, SearchResult } from 'components/models/ui/search';
import type { CustomUser } from 'components/models/ui/user';
import Histogram from 'components/visual/Histogram';
import LineGraph from 'components/visual/LineGraph';
import SearchHeader from 'components/visual/SearchBar/SearchHeader';
import { DEFAULT_SUGGESTION } from 'components/visual/SearchBar/search-textfield';
import ErrorsTable from 'components/visual/SearchResult/errors';
import { safeFieldValue } from 'helpers/utils';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { ErrorDetail } from './error_detail';

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

const ERROR_VIEWER_PARAMS = createSearchParams(p => ({
  query: p.string(''),
  offset: p.number(0).min(0).hidden().ignored(),
  rows: p.number(25).enforced().hidden().ignored(),
  sort: p.string('created desc').ignored(),
  tc: p.enum('4d', TIME_CONTRAINTS),
  filters: p.filters([]),
  track_total_hits: p.number(10000).nullable().ignored(),
  mincount: p.number(0).min(0).hidden().ignored(),
  use_archive: p.boolean(false),
  archive_only: p.boolean(false),
  timeout: p.string('').hidden().ignored()
}));

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

  const [errorResults, setErrorResults] = useState<SearchResult<Error>>(null);
  const [histogram, setHistogram] = useState<HistogramResult>(null);
  const [types, setTypes] = useState<FacetResult>(null);
  const [names, setNames] = useState<FacetResult>(null);
  const [searching, setSearching] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTION);

  const setErrorKey = useCallback(
    (error_key: string) => navigate(`${location.pathname}${location.search || ''}#${error_key}`),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [location.search]
  );

  const handleToggleFilter = useCallback(
    (filter: string) => {
      setSearchObject(o => {
        const filters = o.filters.includes(filter) ? o.filters.filter(f => f !== filter) : [...o.filters, filter];
        return { ...o, offset: 0, filters };
      });
    },
    [setSearchObject]
  );

  useEffect(() => {
    if (!search || !currentUser.is_admin) return;

    const body = search.set(o => ({
      ...o,
      query: o.query || '*',
      filters: o.tc in TC_MAP && o.tc !== '1y' ? [...o.filters, TC_MAP[o.tc]] : o.filters
    }));

    apiCall<SearchResult<Error>>({
      url: `/api/v4/error/list/?${body
        .pick(['query', 'filters', 'offset', 'rows', 'sort', 'track_total_hits'])
        .toString()}`,
      onSuccess: ({ api_response }) => setErrorResults(api_response),
      onEnter: () => setSearching(true),
      onExit: () => setSearching(false)
    });

    apiCall<HistogramResult>({
      url: '/api/v4/search/histogram/error/created/',
      method: 'POST',
      body: {
        ...body.pick(['query', 'mincount', 'filters', 'timeout', 'use_archive', 'archive_only']).toObject(),
        start: START_MAP[body.get('tc')],
        end: 'now',
        gap: GAP_MAP[body.get('tc')]
      },
      onSuccess: ({ api_response }) => setHistogram(api_response)
    });

    apiCall<FacetResult>({
      url: '/api/v4/search/facet/error/response.service_name/',
      method: 'POST',
      body: body
        .pick(['query', 'mincount', 'filters', 'timeout', 'use_archive', 'archive_only'])
        .set(s => {
          s.mincount = 1;
          return s;
        })
        .toObject(),
      onSuccess: ({ api_response }) =>
        setNames(
          Object.fromEntries(
            Object.keys(api_response)
              .sort((a, b) => api_response[b] - api_response[a])
              .map(k => [k, api_response[k]])
          )
        )
    });

    apiCall<FacetResult>({
      url: '/api/v4/search/facet/error/type/',
      method: 'POST',
      body: body
        .pick(['query', 'mincount', 'filters', 'timeout', 'use_archive', 'archive_only'])
        .set(s => {
          s.mincount = 1;
          return s;
        })
        .toObject(),
      onSuccess: ({ api_response }) =>
        setTypes(
          Object.fromEntries(
            Object.keys(api_response)
              .sort((a, b) => api_response[b] - api_response[a])
              .map(k => [k, api_response[k]])
          )
        )
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.is_admin, search]);

  useEffect(() => {
    apiCall({
      url: '/api/v4/search/fields/error/',
      onSuccess: ({ api_response }) => {
        const values = Object.keys(api_response).filter(name => api_response[name].indexed);
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

  return currentUser.is_admin ? (
    <PageFullWidth margin={4}>
      <Grid container spacing={2} style={{ paddingBottom: theme.spacing(2) }}>
        <Grid size={{ xs: 12, sm: 7, md: 9, xl: 10 }}>
          <Typography variant="h4">{t('title')}</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 5, md: 3, xl: 2 }}>
          <FormControl size="small" fullWidth>
            <Select
              disabled={searching}
              value={search.get('tc')}
              variant="outlined"
              onChange={event => setSearchObject(o => ({ ...o, offset: 0, tc: event.target.value as TimeContraint }))}
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
                tooltip: {
                  title: search.has('filters', 'type:(EXCEPTION OR UNKNOWN)')
                    ? t('filter.exception.remove')
                    : t('filter.exception.add')
                },
                icon: { children: <ReportProblemOutlinedIcon /> },
                button: {
                  color: search.has('filters', 'type:(EXCEPTION OR UNKNOWN)') ? 'primary' : 'default',
                  onClick: () => handleToggleFilter('type:(EXCEPTION OR UNKNOWN)')
                }
              },
              {
                tooltip: {
                  title: search.has('filters', 'type:(SERVICE* OR TASK*)')
                    ? t('filter.canceled.remove')
                    : t('filter.canceled.add')
                },
                icon: { children: <CancelOutlinedIcon /> },
                button: {
                  color: search.has('filters', 'type:(SERVICE* OR TASK*)') ? 'primary' : 'default',
                  onClick: () => handleToggleFilter('type:(SERVICE* OR TASK*)')
                }
              },
              {
                tooltip: {
                  title: search.has('filters', 'type:MAX*') ? t('filter.maxed.remove') : t('filter.maxed.add')
                },
                icon: { children: <PanToolOutlinedIcon /> },
                button: {
                  color: search.has('filters', 'type:MAX*') ? 'primary' : 'default',
                  onClick: () => handleToggleFilter('type:MAX*')
                }
              }
            ]}
          />
        </div>
      </PageHeader>

      {errorResults !== null && errorResults.total !== 0 && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Histogram
              dataset={histogram}
              height="200px"
              title={t(`graph.histogram.title.${search.get('tc')}`)}
              datatype={t('graph.datatype')}
              isDate
              verticalLine
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <LineGraph
              dataset={names}
              height="200px"
              title={t('graph.name.title')}
              datatype={t('graph.datatype')}
              onClick={(evt, element) => {
                if (!searching && element.length > 0) {
                  const filter = `response.service_name:${Object.keys(names)[element[0].index]}`;
                  setSearchObject(o => ({ ...o, offset: 0, filters: [...o.filters, filter] }));
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
              onClick={(evt, element) => {
                if (!searching && element.length > 0) {
                  const filter = `type:${safeFieldValue(Object.keys(types)[element[0].index])}`;
                  setSearchObject(o => ({ ...o, offset: 0, filters: [...o.filters, filter] }));
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
  <SearchParamsProvider params={ERROR_VIEWER_PARAMS}>
    <ErrorViewer />
  </SearchParamsProvider>
);

export const ErrorViewerPage = React.memo(WrappedErrorViewerPage);
export default ErrorViewerPage;
