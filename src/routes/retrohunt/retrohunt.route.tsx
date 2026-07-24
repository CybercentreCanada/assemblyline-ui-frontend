import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import DataObjectOutlinedIcon from '@mui/icons-material/DataObjectOutlined';
import PersonIcon from '@mui/icons-material/Person';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import { Pagination, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useAppNavigate } from 'core/router';
import { createAppRoute } from 'core/routes';
import useALContext from 'deprecated/hooks/useALContext';
import useMyAPI from 'deprecated/hooks/useMyAPI';
import type { SearchResult } from 'models/api/search';
import type { IndexDefinition } from 'models/api/user';
import type { RetrohuntIndexed, RetrohuntProgress } from 'models/base/retrohunt';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { RetrohuntTable } from 'routes/search/components/retrohunt';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { IconButton } from 'ui/buttons/IconButton';
import { ChipList } from 'ui/ChipList';
import { PageHeader } from 'ui/layouts/PageHeader';
import { PageContainer } from 'ui/pages/PageContainer';
import { PageFullWidth } from 'ui/pages/PageFullWidth';
import SearchBar from 'ui/SearchBar/search-bar';
import { DEFAULT_SUGGESTION } from 'ui/SearchBar/search-textfield';
import SearchResultCount from 'ui/SearchResultCount';
import type SimpleSearchQuery from '/ui/SearchBar/simple-search-query';

const PAGE_SIZE = 25;
const MAX_TRACKED_RECORDS = 10000;
const SOCKETIO_NAMESPACE = '/retrohunt';

export const RetrohuntPage = memo(() => {
  const { t } = useTranslation(['retrohunt']);
  const theme = useTheme();
  const location = useLocation();
  const navigate = useAppNavigate();
  const { apiCall } = useMyAPI();

  const { user: currentUser, indexes, configuration } = useALContext();
  const downSM = useMediaQuery(theme.breakpoints.down('md'));

  const [retrohuntResults, setRetrohuntResults] = useState<SearchResult<RetrohuntIndexed>>(null);
  const [query, setQuery] = useState<SimpleSearchQuery>(null);
  const [searching, setSearching] = useState<boolean>(false);

  const filterValue = useRef<string>('');
  const sio = useRef<Socket<any, any>>(null);
  const resultListeners = useRef<string[]>([]);

  const suggestions = useMemo<IndexDefinition>(
    () => ({ ...indexes.retrohunt, ...DEFAULT_SUGGESTION }),
    [indexes.retrohunt]
  );

  const pageCount = useMemo<number>(
    () =>
      retrohuntResults && 'total' in retrohuntResults
        ? Math.ceil(Math.min(retrohuntResults.total, MAX_TRACKED_RECORDS) / PAGE_SIZE)
        : 0,
    [retrohuntResults]
  );

  const last24hDate = useMemo<string>(
    () =>
      new Date(new Date().setMinutes(0, 0, 0) - 24 * 60 * 60 * 1000)
        .toISOString()
        .replaceAll(':', '\\:')
        .replaceAll('.', '\\.'),
    []
  );

  const hasFilter = useCallback((filter: string) => query?.getAll('filters')?.includes(filter), [query]);

  const handleToggleFilter = useCallback(
    (filter: string) => {
      if (query?.getAll('filters')?.includes(filter)) query.remove('filters', filter);
      else query.add('filters', filter);

      navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
    },
    [location.hash, location.pathname, navigate, query]
  );

  const handleQueryChange = useCallback(
    (key: string, value: string | number) => {
      query.set(key, value);
      const q = new SimpleSearchQuery(query.toString(), DEFAULT_QUERY);
      navigate(`${location.pathname}?${q.getDeltaString()}${location.hash}`);
    },
    [location.hash, location.pathname, navigate, query]
  );

  const handleQueryRemove = useCallback(
    (key: string | string[]) => {
      if (typeof key === 'string') query.delete(key);
      else key.forEach(k => query.delete(k));
      const q = new SimpleSearchQuery(query.toString(), DEFAULT_QUERY);
      navigate(`${location.pathname}?${q.getDeltaString()}${location.hash}`);
    },
    [location.hash, location.pathname, navigate, query]
  );

  const handleReload = useCallback(
    (curQuery: SimpleSearchQuery) => {
      if (curQuery && currentUser.roles.includes('retrohunt_view') && configuration?.retrohunt?.enabled) {
        apiCall({
          method: 'POST',
          url: `/api/v4/retrohunt/`,
          body: curQuery.getParams(),
          onSuccess: api_data => {
            const { items, total, rows, offset } = api_data.api_response;
            if (items.length === 0 && offset !== 0 && offset >= total) {
              curQuery.set('offset', Math.floor(total / rows) * rows);
              handleReload(curQuery);
            } else {
              setRetrohuntResults(api_data.api_response);
            }
          },
          onEnter: () => setSearching(true),
          onExit: () => setSearching(false)
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [configuration?.retrohunt?.enabled, currentUser.roles]
  );

  const handleCreateRetrohunt = useCallback(
    (retrohunt: Partial<Retrohunt>) => {
      navigate(`${location.pathname}${location.search}#${retrohunt?.key}`);
    },
    [location.pathname, location.search, navigate]
  );

  const handleOpenCreatePage = useCallback(() => {
    if (currentUser.roles.includes('retrohunt_run') && configuration?.retrohunt?.enabled) {
      setGlobalDrawer(<RetrohuntCreate isDrawer onCreateRetrohunt={handleCreateRetrohunt} />, { hasMaximize: true });
      navigate(`${location.pathname}?${query.getDeltaString()}`);
    }
  }, [
    configuration?.retrohunt?.enabled,
    currentUser.roles,
    handleCreateRetrohunt,
    location.pathname,
    navigate,
    query,
    setGlobalDrawer
  ]);

  const handleRowClick = useCallback(
    (item: RetrohuntIndexed) => {
      const hashSearch = new URL(`${window.location.origin}/${location.hash.slice(1)}`);
      navigate(`${location.pathname}${location.search}#${item?.key}${hashSearch.search}`);
    },
    [location, navigate]
  );

  useEffect(() => {
    if (query) handleReload(query);
  }, [handleReload, query]);

  useEffect(() => {
    function reload() {
      handleReload(query);
    }
    window.addEventListener('reloadRetrohunts', reload);
    return () => {
      window.removeEventListener('reloadRetrohunts', reload);
    };
  }, [handleReload, query]);

  useEffect(() => {
    const socket = io(SOCKETIO_NAMESPACE);

    socket.on('connect', () => {
      // eslint-disable-next-line no-console
      console.debug(`Socket-IO :: /retrohunt/root (connect)`);
    });

    socket.on('disconnect', () => {
      // eslint-disable-next-line no-console
      console.debug(`Socket-IO :: /retrohunt/root (disconnect)`);
    });

    socket.on('status', (data: RetrohuntProgress) => {
      const progress = Math.floor(100 * (data.type === 'Filtering' || data.type === 'Yara' ? data.progress : 0));
      // eslint-disable-next-line no-console
      console.debug(`Socket-IO :: /retrohunt/root (status) :: ${data.type} - ${progress}% - ${data.key}`);

      setRetrohuntResults(results => ({
        ...results,
        items: results.items.map(result => {
          if (result.key !== data.key) return result;

          if (data.type === 'Finished') {
            resultListeners.current = resultListeners.current.filter(r => r !== data.key);
            setTimeout(() => window.dispatchEvent(new CustomEvent('reloadRetrohunts')), 1000);
          }

          return {
            ...result,
            ...(data.type === 'Finished' && {
              ...data.search,
              total_errors: data.search.errors.length,
              total_warnings: data.search.warnings.length
            }),
            finished: data.type === 'Finished',
            step: data.type,
            progress: data.type === 'Filtering' || data.type === 'Yara' ? data.progress : 0
          };
        })
      }));
    });

    sio.current = socket;

    return () => {
      socket.disconnect();
      sio.current = null;
      resultListeners.current = [];
    };
  }, []);

  useEffect(() => {
    if (!sio.current || !retrohuntResults) return;

    retrohuntResults.items
      .filter(result => !result.finished && !resultListeners.current.includes(result.key))
      .forEach(result => {
        // eslint-disable-next-line no-console
        console.debug(`Socket-IO :: /retrohunt/root (listen) :: ${result.key}`);

        resultListeners.current = [...resultListeners.current, result.key];
        sio.current.emit('listen', { key: result.key });
      });
  }, [retrohuntResults]);

  return (
    <PageFullWidth margin={4}>
      <PageHeader
        primary={t('title')}
        slotProps={{
          root: { style: { marginBottom: theme.spacing(2) } }
        }}
        actions={
          <IconButton
            color="success"
            preventRender={!currentUser.roles.includes('retrohunt_run')}
            size="large"
            tooltip={t('tooltip.add')}
            onClick={handleOpenCreatePage}
          >
            <AddCircleOutlineOutlinedIcon />
          </IconButton>
        }
      />

      <PageContainer isSticky>
        <div style={{ paddingTop: theme.spacing(1) }}>
          <SearchBar
            initValue={query ? query.get('query', '') : ''}
            placeholder={t('filter')}
            searching={searching}
            suggestions={suggestions}
            onValueChange={value => {
              filterValue.current = value;
            }}
            onClear={() => handleQueryRemove(['query', 'rows', 'offset'])}
            onSearch={() => {
              if (filterValue.current !== '') {
                handleQueryChange('query', filterValue.current);
                handleQueryChange('offset', 0);
              } else handleQueryRemove(['query', 'rows', 'offset']);
            }}
            buttons={[
              {
                icon: <PersonIcon fontSize={downSM ? 'small' : 'medium'} />,
                tooltip: hasFilter(`creator:${currentUser.username}`)
                  ? t('filter.creator_self.remove')
                  : t('filter.creator_self.add'),
                props: {
                  color: hasFilter(`creator:${currentUser.username}`) ? 'primary' : 'default',
                  onClick: () => handleToggleFilter(`creator:${currentUser.username}`)
                }
              },
              {
                icon: <TimerOutlinedIcon fontSize={downSM ? 'small' : 'medium'} />,
                tooltip: hasFilter(`completed_time:>=${last24hDate}`)
                  ? t('filter.completed_last_24.remove')
                  : t('filter.completed_last_24.add'),
                props: {
                  color: hasFilter(`completed_time:>=${last24hDate}`) ? 'primary' : 'default',
                  onClick: () => handleToggleFilter(`completed_time:>=${last24hDate}`)
                }
              }
            ]}
          >
            {retrohuntResults !== null && (
              <div
                style={{
                  fontStyle: 'italic',
                  paddingTop: theme.spacing(0.5),
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'flex-end'
                }}
              >
                {retrohuntResults.total !== 0 && (
                  <Typography variant="subtitle1" color="secondary" style={{ flexGrow: 1 }}>
                    {searching ? (
                      <span>{t('searching')}</span>
                    ) : (
                      <span>
                        <SearchResultCount count={retrohuntResults.total} />
                        {query.get('query') || query.get('filters')
                          ? t(`filtered${retrohuntResults.total === 1 ? '' : 's'}`)
                          : t(`total${retrohuntResults.total === 1 ? '' : 's'}`)}
                      </span>
                    )}
                  </Typography>
                )}

                {pageCount > 1 && (
                  <Pagination
                    page={Math.ceil(1 + query.get('offset') / PAGE_SIZE)}
                    onChange={(e, value) => handleQueryChange('offset', (value - 1) * PAGE_SIZE)}
                    count={pageCount}
                    shape="rounded"
                    size="small"
                  />
                )}
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
      </PageContainer>

      <div
        style={{
          paddingTop: theme.spacing(2),
          paddingLeft: theme.spacing(0.5),
          paddingRight: theme.spacing(0.5)
        }}
      >
        <RetrohuntTable retrohuntResults={retrohuntResults} />
      </div>
    </PageFullWidth>
  );
});

export const RetrohuntRoute = createAppRoute({
  title: {
    ns: 'app',
    key: 'drawer.retrohunt'
  },
  icon: {
    primary: <DataObjectOutlinedIcon />
  },
  ancestor: null,
  component: RetrohuntPage,
  path: '/retrohunt',
  search: s => ({
    query: s.string(''),
    offset: s.number(0).min(0).source('transient').ephemeral(),
    rows: s.number(25).locked().source('transient').ephemeral(),
    sort: s.string('created_time desc'),
    fl: s.string(
      'indices,classification,search_classification,creator,description,expiry_ts,start_group,end_group,created_time,started_time,completed_time,key,raw_query,yara_signature,finished,truncated'
    ),
    filters: s.filters([])
  }),
  disabled: s => !s.configuration?.retrohunt?.enabled,
  forbidden: s => !s.user.roles.includes('retrohunt_view')
});
