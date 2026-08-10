import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import PanToolOutlinedIcon from '@mui/icons-material/PanToolOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import { Grid, Typography, useTheme } from '@mui/material';
import { useAppNavigate } from 'core/router';
import { createAppRoute, useAppSearchSnapshot } from 'core/routes';
import useALContext from 'deprecated/hooks/useALContext';
import useMyAPI from 'deprecated/hooks/useMyAPI';
import type { FacetResult, HistogramResult, SearchResult } from 'models/api/search';
import type { IndexDefinition } from 'models/api/user';
import type { Error } from 'models/base/error';
import { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorsTable } from 'routes/search/components/errors';
import { safeFieldValue } from 'shared/utils/utils';
import { DateTimeRangePicker } from 'ui/DateTime/DateTimeRangePicker';
import { LuceneDateTime, LuceneDateTimeGap } from 'ui/DateTime/LuceneDateTime';
import Histogram from 'ui/Histogram';
import LineGraph from 'ui/LineGraph';
import { PageContainer } from 'ui/pages/PageContainer';
import { PageFullWidth } from 'ui/pages/PageFullWidth';
import { DEFAULT_SUGGESTION } from 'ui/SearchBar/search-textfield';
import SearchHeader from 'ui/SearchBar/SearchHeader';

//*****************************************************************************************
// AdminErrorViewer Page
//*****************************************************************************************

export const AdminErrorViewerPage = memo(() => {
  const { t, i18n } = useTranslation(['adminErrorViewer']);
  const theme = useTheme();
  const navigate = useAppNavigate<'/admin/errors'>();
  const { apiCall } = useMyAPI();
  const { user: currentUser } = useALContext();
  const search = useAppSearchSnapshot<'/admin/errors'>();

  const [errorResults, setErrorResults] = useState<SearchResult<Error>>(null);
  const [histogram, setHistogram] = useState<HistogramResult>(null);
  const [types, setTypes] = useState<FacetResult>(null);
  const [names, setNames] = useState<FacetResult>(null);
  const [searching, setSearching] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<IndexDefinition>(DEFAULT_SUGGESTION);

  const handleToggleFilter = useCallback(
    (filter: string) => {
      navigate.here().update(s => ({
        ...s,
        search: {
          ...s.search,
          offset: 0,
          filters: s.search.filters.includes(filter)
            ? s.search.filters.filter(f => f !== filter)
            : [...s.search.filters, filter]
        }
      }));
    },
    [navigate]
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
        .set(s => ({ ...s, mincount: 1 }))
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
        .set(s => ({ ...s, mincount: 1 }))
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
    apiCall<IndexDefinition>({
      url: '/api/v4/search/fields/error/',
      onSuccess: ({ api_response }) => setSuggestions({ ...api_response, ...DEFAULT_SUGGESTION })
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
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
          onChange={(e, { start, end, gap }) =>
            navigate.here().update(s => ({ ...s, search: { ...s.search, offset: 0, start, end, gap } }))
          }
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
            onChange={v =>
              navigate
                .here()
                .update(s => ({ ...s, search: { ...s.search, ...AdminErrorViewerRoute.search.full(v).toObject() } }))
            }
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
                  navigate.here().update(s => ({
                    ...s,
                    search: { ...s.search, offset: 0, filters: [...s.search.filters, filter] }
                  }));
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
                  navigate.here().update(s => ({
                    ...s,
                    search: { ...s.search, offset: 0, filters: [...s.search.filters, filter] }
                  }));
                }
              }}
            />
          </Grid>
        </Grid>
      )}

      <div style={{ paddingTop: theme.spacing(2), paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
        <ErrorsTable errorResults={errorResults} />
      </div>
    </PageFullWidth>
  );
});

AdminErrorViewerPage.displayName = 'AdminErrorViewerPage';

//*****************************************************************************************
// AdminErrorViewer Route
//*****************************************************************************************

export const AdminErrorViewerRoute = createAppRoute({
  component: AdminErrorViewerPage,

  path: '/admin/errors',
  search: s => ({
    query: s.string(''),
    offset: s.number(0).min(0).source('transient').ephemeral(),
    rows: s.number(25).locked().source('transient').ephemeral(),
    sort: s.string('created desc').ephemeral(),
    start: s.string('now-4d'),
    end: s.string('now'),
    gap: s.string('4h'),
    filters: s.filters([]),
    track_total_hits: s.number(10000).nullable().ephemeral(),
    mincount: s.number(0).min(0).source('transient').ephemeral(),
    use_archive: s.boolean(false),
    archive_only: s.boolean(false),
    timeout: s.string('').source('transient').ephemeral()
  }),

  ancestor: '/admin',
  shortname: () => ({ i18nKey: 'adminmenu.errors', ns: 'app' }),
  fullname: () => ({ i18nKey: 'adminmenu.errors', ns: 'app' }),
  shorticon: () => <ErrorOutlineOutlinedIcon />,
  fullicon: () => <ErrorOutlineOutlinedIcon />,

  disabled: () => false,
  forbidden: (_location, config) => !config.user.is_admin
});
