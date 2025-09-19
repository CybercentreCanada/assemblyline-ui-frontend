import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PanToolOutlinedIcon from '@mui/icons-material/PanToolOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import { Grid, Typography, useTheme } from '@mui/material';
import { useAppUser } from 'commons/components/app/hooks';
import PageContainer from 'commons/components/pages/PageContainer';
import PageFullWidth from 'commons/components/pages/PageFullWidth';
import {
  createSearchParams,
  SearchParamsProvider,
  useSearchParams
} from 'components/core/SearchParams/createSearchParams';
import useDrawer from 'components/hooks/useDrawer';
import useMyAPI from 'components/hooks/useMyAPI';
import type { Error } from 'components/models/base/error';
import type { FacetResult, HistogramResult, SearchResult } from 'components/models/ui/search';
import type { CustomUser } from 'components/models/ui/user';
import { ErrorDetail } from 'components/routes/admin/error_detail';
import { DateTimeRangePicker } from 'components/visual/DateTime/DateTimeRangePicker';
import { LuceneDateTime, LuceneDateTimeGap } from 'components/visual/DateTime/LuceneDateTime';
import Histogram from 'components/visual/Histogram';
import LineGraph from 'components/visual/LineGraph';
import SearchHeader from 'components/visual/SearchBar/SearchHeader';
import { DEFAULT_SUGGESTION } from 'components/visual/SearchBar/search-textfield';
import ErrorsTable from 'components/visual/SearchResult/errors';
import { safeFieldValue } from 'helpers/utils';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useLocation, useNavigate } from 'react-router';

const ERROR_VIEWER_PARAMS = createSearchParams(p => ({
  query: p.string(''),
  offset: p.number(0).min(0).origin('snapshot').ephemeral(),
  rows: p.number(25).locked().origin('snapshot').ephemeral(),
  sort: p.string('created desc').ephemeral(),
  start: p.string('now-4d'),
  end: p.string('now'),
  gap: p.string('4h'),
  filters: p.filters([]),
  track_total_hits: p.number(10000).nullable().ephemeral(),
  mincount: p.number(0).min(0).origin('snapshot').ephemeral(),
  use_archive: p.boolean(false),
  archive_only: p.boolean(false),
  timeout: p.string('').origin('snapshot').ephemeral()
}));

type ErrorViewerParams = typeof ERROR_VIEWER_PARAMS;

const ErrorViewer = () => {
  const { t, i18n } = useTranslation(['adminErrorViewer']);
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

    const body = search.set(o => {
      const start = new LuceneDateTime(o.start, 'start', i18n.language).toLucene();
      const end = new LuceneDateTime(o.end, 'end', i18n.language).toLucene();
      const gap = new LuceneDateTimeGap(o.gap, start, end, 50, '4h', true, i18n.language).toString();

      return {
        ...o,
        query: o.query || '*',
        start,
        end,
        gap,
        filters: [...o.filters, `created:[${start} TO ${end}]`]
      };
    });

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
      body: body
        .pick(['query', 'mincount', 'filters', 'timeout', 'use_archive', 'archive_only', 'start', 'end', 'gap'])
        .toObject(),
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
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing(2),
          paddingBottom: theme.spacing(2)
        }}
      >
        <Typography variant="h4" sx={{ flex: 1 }}>
          {t('title')}
        </Typography>

        <DateTimeRangePicker
          value={{ start: search.get('start'), end: search.get('end'), gap: search.get('gap') }}
          disabled={searching}
          hasGap
          onChange={(e, { start, end, gap }) => setSearchObject(o => ({ ...o, offset: 0, start, end, gap }))}
        />
      </div>

      <PageContainer isSticky>
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
      </PageContainer>

      {errorResults !== null && errorResults.total !== 0 && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Histogram
              dataset={histogram}
              height="200px"
              title={t('graph.histogram.title')}
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
