import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import DataObjectOutlinedIcon from '@mui/icons-material/DataObjectOutlined';
import PersonIcon from '@mui/icons-material/Person';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import { useTheme } from '@mui/material';
import { useAppNavigate } from 'core/router';
import { createAppRoute, useAppSearchSnapshot } from 'core/routes';
import { AppPageContainer, AppPageFullWidth } from 'core/template';
import useALContext from 'deprecated/hooks/useALContext';
import useMyAPI from 'deprecated/hooks/useMyAPI';
import type { SearchResult } from 'models/api/search';
import type { IndexDefinition } from 'models/api/user';
import type { RetrohuntIndexed, RetrohuntProgress } from 'models/base/retrohunt';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RetrohuntTable } from 'routes/search/components/retrohunt';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { IconButton } from 'ui/buttons/IconButton';
import { PageHeader } from 'ui/layouts/PageHeader';
import { DEFAULT_SUGGESTION } from 'ui/SearchBar/search-textfield';
import SearchHeader from 'ui/SearchBar/SearchHeader';

const SOCKETIO_NAMESPACE = '/retrohunt';

export const RetrohuntPage = memo(() => {
  const { t } = useTranslation(['retrohunt']);
  const theme = useTheme();
  const search = useAppSearchSnapshot<'/retrohunt'>();
  const navigate = useAppNavigate<'/retrohunt'>();
  const { apiCall } = useMyAPI();

  const { user: currentUser, indexes, configuration } = useALContext();

  const [retrohuntResults, setRetrohuntResults] = useState<SearchResult<RetrohuntIndexed>>(null);
  const [searching, setSearching] = useState<boolean>(false);

  const sio = useRef<Socket<any, any>>(null);
  const resultListeners = useRef<string[]>([]);

  const suggestions = useMemo<IndexDefinition>(
    () => ({ ...indexes.retrohunt, ...DEFAULT_SUGGESTION }),
    [indexes.retrohunt]
  );

  const last24hDate = useMemo<string>(
    () =>
      new Date(new Date().setMinutes(0, 0, 0) - 24 * 60 * 60 * 1000)
        .toISOString()
        .replaceAll(':', '\\:')
        .replaceAll('.', '\\.'),
    []
  );

  const handleToggleFilter = useCallback(
    (filter: string) =>
      navigate.here<'/retrohunt'>().update(s => ({
        ...s,
        search: {
          ...s?.search,
          offset: 0,
          filters: s.search.filters.includes(filter)
            ? s.search.filters.filter(f => f !== filter)
            : [...s.search.filters, filter]
        }
      })),

    [navigate]
  );

  const handleReload = useCallback(
    (curSearch: typeof search) => {
      if (curSearch && currentUser.roles.includes('retrohunt_view') && configuration?.retrohunt?.enabled) {
        apiCall({
          method: 'POST',
          url: `/api/v4/retrohunt/`,
          body: curSearch.toObject(),
          onSuccess: api_data => {
            const { items, total, rows, offset } = api_data.api_response;
            if (items.length === 0 && offset !== 0 && offset >= total) {
              curSearch.set(s => ({ ...s, offset: Math.floor(total / rows) * rows }));
              handleReload(curSearch);
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

  useEffect(() => {
    if (search) handleReload(search);
  }, [handleReload, search?.toString()]);

  useEffect(() => {
    function reload() {
      handleReload(search);
    }
    window.addEventListener('reloadRetrohunts', reload);
    return () => {
      window.removeEventListener('reloadRetrohunts', reload);
    };
  }, [handleReload, search?.toString()]);

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
    <AppPageFullWidth>
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
            onClick={() => navigate.to().create({ route: '/retrohunt/create' })}
          >
            <AddCircleOutlineOutlinedIcon />
          </IconButton>
        }
      />

      <AppPageContainer isSticky>
        <div style={{ paddingTop: theme.spacing(1) }}>
          <SearchHeader
            params={search.toParams()}
            loading={searching}
            results={retrohuntResults}
            resultLabel={
              search.get('query') || search.get('filters')?.length
                ? t(`filtered${retrohuntResults?.total === 1 ? '' : 's'}`)
                : t(`total${retrohuntResults?.total === 1 ? '' : 's'}`)
            }
            onChange={v =>
              navigate
                .here()
                .update(s => ({ ...s, search: { ...s.search, ...RetrohuntRoute.search.full(v).toObject() } }))
            }
            paramDefaults={search.defaults().toObject()}
            searchInputProps={{ placeholder: t('filter'), options: suggestions }}
            actionProps={[
              {
                tooltip: {
                  title: search.has('filters', `creator:${currentUser.username}`)
                    ? t('filter.creator_self.remove')
                    : t('filter.creator_self.add')
                },
                icon: { children: <PersonIcon /> },
                button: {
                  color: search.has('filters', `creator:${currentUser.username}`) ? 'primary' : 'default',
                  onClick: () => handleToggleFilter(`creator:${currentUser.username}`)
                }
              },
              {
                tooltip: {
                  title: search.has('filters', `completed_time:>=${last24hDate}`)
                    ? t('filter.completed_last_24.remove')
                    : t('filter.completed_last_24.add')
                },
                icon: { children: <TimerOutlinedIcon /> },
                button: {
                  color: search.has('filters', `completed_time:>=${last24hDate}`) ? 'primary' : 'default',
                  onClick: () => handleToggleFilter(`completed_time:>=${last24hDate}`)
                }
              }
            ]}
          />
        </div>
      </AppPageContainer>

      <div
        style={{
          paddingTop: theme.spacing(2),
          paddingLeft: theme.spacing(0.5),
          paddingRight: theme.spacing(0.5)
        }}
      >
        <RetrohuntTable retrohuntResults={retrohuntResults} />
      </div>
    </AppPageFullWidth>
  );
});

export const RetrohuntRoute = createAppRoute({
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
    filters: s.filters([]),
    track_total_hits: s.number(null).source('transient').nullable().ephemeral()
  }),

  ancestor: null,
  shortname: () => ['app_route.retrohunt.shortname', { ns: 'retrohunt' }],
  fullname: () => ['app_route.retrohunt.fullname', { ns: 'retrohunt' }],
  shorticon: () => <DataObjectOutlinedIcon />,
  fullicon: () => <DataObjectOutlinedIcon />,

  disabled: (_location, config) => !config.configuration?.retrohunt?.enabled,
  forbidden: (_location, config) => !config.user.roles.includes('retrohunt_view')
});
