import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import AssignmentLateOutlinedIcon from '@mui/icons-material/AssignmentLateOutlined';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import FileOpenOutlinedIcon from '@mui/icons-material/FileOpenOutlined';
import { Chip, Grid, MenuItem, Pagination, Select, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import { useAppNavigate } from 'core/router';
import { createAppRoute, useAppSearchSnapshot } from 'core/routes';
import { AppPageContainer, AppPageFullWidth } from 'core/template';
import useALContext from 'deprecated/hooks/useALContext';
import useMyAPI from 'deprecated/hooks/useMyAPI';
import useMySnackbar from 'deprecated/hooks/useMySnackbar';
import { InferSearchParamValueMapFromEngine } from 'features/search-params';
import type { FacetResult, HistogramResult, SearchResult } from 'models/api/search';
import type { IndexDefinition } from 'models/api/user';
import type { FileIndexed } from 'models/base/file';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArchivesTable } from 'routes/search/components/archives';
import { safeFieldValue } from 'shared/utils/utils';
import { ChipList } from 'ui/ChipList';
import Histogram from 'ui/Histogram';
import LineGraph from 'ui/LineGraph';
import SearchBar from 'ui/SearchBar/search-bar';
import { DEFAULT_SUGGESTION } from 'ui/SearchBar/search-textfield';
import SearchResultCount from 'ui/SearchResultCount';

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

export const ArchivesPage = memo(() => {
  const { t } = useTranslation(['archive']);
  const theme = useTheme();
  const downSM = useMediaQuery(theme.breakpoints.down('md'));

  const search = useAppSearchSnapshot<'/archives'>();
  const navigate = useAppNavigate<'/archives'>();

  const { apiCall } = useMyAPI();
  const { user: currentUser, indexes } = useALContext();
  const { showErrorMessage } = useMySnackbar();

  const [fileResults, setFileResults] = useState<SearchResult<FileIndexed>>(null);
  const [histogram, setHistogram] = useState<HistogramResult>(null);
  const [types, setTypes] = useState<Record<string, number>>(null);
  const [labels, setLabels] = useState<Record<string, number>>(null);
  const [searching, setSearching] = useState<boolean>(false);

  const queryValue = useRef<string>('');

  const suggestions = useMemo<IndexDefinition>(() => ({ ...indexes.file, ...DEFAULT_SUGGESTION }), [indexes.file]);

  const hasFilter = useCallback((filter: string) => search.get('filters')?.includes(filter), [search?.toString()]);

  const handleToggleFilter = useCallback(
    (filter: string) =>
      navigate.here<'/archives'>().update(s => ({
        ...s,
        search: {
          ...s.search,
          offset: 0,
          filters: s.search.filters.includes(filter)
            ? s.search.filters.filter(f => f !== filter)
            : [...s.search.filters, filter]
        }
      })),
    [navigate]
  );

  const handleClear = useCallback(() => {
    navigate.here<'/archives'>().update(s => ({ ...s, search: { ...s.search, query: '', offset: 0 } }));
  }, [navigate]);

  const handleSearch = useCallback(
    (value: string) => {
      if (value !== '') {
        navigate.here<'/archives'>().update(s => ({ ...s, search: { ...s.search, query: value, offset: 0 } }));
      } else {
        handleClear();
      }
    },
    [handleClear, navigate]
  );

  const handleRowClick = useCallback(
    (_event: React.MouseEvent<HTMLElement>, file: FileIndexed) => {
      navigate.to().create(s => ({
        route: '/archive/:id',
        path: { id: file.sha256, tab: s.route === '/archive/:id/:tab' ? s.path.tab : null }
      }));
    },
    [navigate]
  );

  const handleLabelClick = useCallback(
    (_event: React.MouseEvent<HTMLDivElement, MouseEvent>, label: string) => {
      if (!searching) handleToggleFilter(`labels:${safeFieldValue(label)}`);
    },
    [handleToggleFilter, searching]
  );

  const buildRequestBody = useCallback(() => {
    const tc = search.get('tc') || DEFAULT_TC;
    const filters = [...search.get('filters')];
    if (tc !== '1y') filters.push(TC_MAP[tc as keyof typeof TC_MAP]);
    if (!search.get('supplementary')) filters.push('NOT is_supplementary:true');

    return {
      ...search
        .omit(['tc', 'supplementary'])
        .set(s => ({ ...s, query: s.query || '*' }))
        .toObject(),
      filters
    };
  }, [search?.toString()]);

  const buildFacetParams = useCallback((body: InferSearchParamValueMapFromEngine<typeof ArchivesRoute.search>) => {
    const params = new URLSearchParams();
    params.set('query', body.query);
    for (const filter of (body.filters as string[]) ?? []) {
      params.append('filters', filter);
    }

    params.set('archive_only', `${body.archive_only}`);
    return params;
  }, []);

  const handleReload = useCallback(() => {
    if (!currentUser.roles.includes('archive_view')) return;

    const tc = search.get('tc') || DEFAULT_TC;
    const body = buildRequestBody();
    const facetParams = buildFacetParams(body);

    apiCall<SearchResult<FileIndexed>>({
      method: 'POST',
      url: `/api/v4/search/file/`,
      body,
      onSuccess: api_data => setFileResults(api_data.api_response),
      onFailure: api_data => showErrorMessage(api_data.api_error_message),
      onEnter: () => setSearching(true),
      onExit: () => setSearching(false)
    });

    apiCall<HistogramResult>({
      url: `/api/v4/search/histogram/file/seen.last/?start=${START_MAP[tc]}&end=now&gap=${
        GAP_MAP[tc]
      }&mincount=0&${facetParams.toString()}`,
      onSuccess: api_data => setHistogram(api_data.api_response)
    });

    apiCall<FacetResult>({
      url: `/api/v4/search/facet/file/labels/?${facetParams.toString()}`,
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
      url: `/api/v4/search/facet/file/type/?${facetParams.toString()}`,
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
  }, [currentUser.roles, buildRequestBody, buildFacetParams]);

  useEffect(() => {
    handleReload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleReload, search?.toString()]);

  useEffect(() => {
    function reload() {
      handleReload();
    }

    window.addEventListener('reloadArchive', reload);
    return () => {
      window.removeEventListener('reloadArchive', reload);
    };
  }, [handleReload]);

  return (
    <AppPageFullWidth>
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
              value={search.get('tc') || DEFAULT_TC}
              variant="outlined"
              onChange={event =>
                navigate.here<'/archives'>().update(s => ({ ...s, search: { ...s.search, tc: event.target.value } }))
              }
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

      <AppPageContainer isSticky>
        <div style={{ paddingTop: theme.spacing(1) }}>
          <SearchBar
            initValue={search.get('query')}
            placeholder={t('filter')}
            searching={searching}
            suggestions={suggestions}
            onClear={handleClear}
            onSearch={handleSearch}
            onValueChange={(inputValue: string) => {
              queryValue.current = inputValue;
            }}
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
                tooltip: search.get('supplementary') ? t('supplementary.exclude') : t('supplementary.include'),
                props: {
                  color: search.get('supplementary') ? 'primary' : 'default',
                  onClick: () =>
                    navigate
                      .here<'/archives'>()
                      .update(s => ({ ...s, search: { ...s.search, supplementary: !s.search.supplementary } }))
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
                        {search.get('query')
                          ? t(`filtered${fileResults.total === 1 ? '' : 's'}`)
                          : t(`total${fileResults.total === 1 ? '' : 's'}`)}
                      </span>
                    )}
                  </Typography>
                )}

                {fileResults.total > search.get('rows') && (
                  <Pagination
                    page={(search.get('offset') ?? 0) / search.get('rows') + 1}
                    count={Math.ceil(Math.min(fileResults.total, 10000) / search.get('rows'))}
                    shape="rounded"
                    size="small"
                    onChange={(_e, page) =>
                      navigate
                        .here<'/archives'>()
                        .update(s => ({ ...s, search: { ...s.search, offset: (page - 1) * s.search.rows } }))
                    }
                  />
                )}
              </div>
            )}

            <div>
              <ChipList
                items={search.get('filters').map(v => ({
                  variant: 'outlined',
                  label: `${v}`,
                  color: v.indexOf('NOT ') === 0 ? 'error' : null,
                  onClick: () =>
                    navigate.here<'/archives'>().update(s => ({
                      ...s,
                      search: {
                        ...s.search,
                        filters: s.search.filters.map(f =>
                          f !== v ? f : v.indexOf('NOT ') === 0 ? v.substring(5, v.length - 1) : `NOT (${v})`
                        )
                      }
                    })),
                  onDelete: () =>
                    navigate.here<'/archives'>().update(s => ({
                      ...s,
                      search: { ...s.search, filters: s.search.filters.filter(f => f !== v) }
                    }))
                }))}
              />
            </div>
          </SearchBar>
        </div>
      </AppPageContainer>

      {fileResults !== null && fileResults.total !== 0 && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Histogram
              dataset={histogram}
              height="200px"
              title={t(`graph.histogram.title.${search.get('tc') || DEFAULT_TC}`)}
              datatype={t('graph.datatype')}
              isDate
              verticalLine
              onClick={(_evt, element) => {
                if (!searching && element.length > 0) {
                  const ind = element[0].index;
                  const keys = Object.keys(histogram);
                  handleToggleFilter(`archive_ts:[${keys[ind]} TO ${keys.length - 1 === ind ? 'now' : keys[ind + 1]}]`);
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
                  handleToggleFilter(`labels:${safeFieldValue(Object.keys(labels)[ind])}`);
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
                  handleToggleFilter(`type:${safeFieldValue(Object.keys(types)[ind])}`);
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
        <ArchivesTable fileResults={fileResults} onLabelClick={handleLabelClick} onRowClick={handleRowClick} />
      </div>
    </AppPageFullWidth>
  );
});

export const ArchivesRoute = createAppRoute({
  component: ArchivesPage,

  path: '/archives',
  search: s => ({
    query: s.string(''),
    offset: s.number(0).min(0).source('transient').ephemeral(),
    rows: s.number(PAGE_SIZE).locked().source('transient').ephemeral(),
    sort: s.string('archive_ts desc'),
    filters: s.filters([]),
    tc: s.string(DEFAULT_TC),
    supplementary: s.boolean(false),
    track_total_hits: s.number(null).source('transient').nullable().ephemeral(),
    archive_only: s.boolean(true).locked().source('transient').ephemeral()
  }),

  ancestor: null,
  shortname: () => ['app_route.archives.shortname', { ns: 'archive' }],
  fullname: () => ['app_route.archives.fullname', { ns: 'archive' }],
  shorticon: () => <ArchiveOutlinedIcon />,
  fullicon: () => <ArchiveOutlinedIcon />,

  disabled: (_location, config) => !config.configuration?.datastore?.archive?.enabled,
  forbidden: (_location, config) => !config.user.roles.includes('archive_view')
});
