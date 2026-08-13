import AddIcon from '@mui/icons-material/Add';
import NotificationImportantOutlinedIcon from '@mui/icons-material/NotificationImportantOutlined';
import { AlertTitle, useMediaQuery, useTheme } from '@mui/material';
import { useAppNavigate } from 'core/router';
import { createAppRoute, useAppSearchSnapshot } from 'core/routes';
import { AppPageFullWidth } from 'core/template';
import SimpleList from 'deprecated/components/lists/simplelist/SimpleList';
import useALContext from 'deprecated/hooks/useALContext';
import useMyAPI from 'deprecated/hooks/useMyAPI';
import type { InferSearchParamValueMapFromEngine } from 'features/search-params';
import type { IndexDefinition } from 'models/api/user';
import type { Alert, AlertIndexed, AlertItem } from 'models/base/alert';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BiNetworkChart } from 'react-icons/bi';
import AlertActions from 'routes/alerts/components/Actions';
import AlertDefaultSearchParameters from 'routes/alerts/components/DefaultSearchParameters';
import AlertFavorites from 'routes/alerts/components/Favorites';
import AlertFilters from 'routes/alerts/components/Filters';
import AlertListItem from 'routes/alerts/components/ListItem';
import { AlertSearchResults } from 'routes/alerts/components/Results';
import SearchHeader from 'routes/alerts/components/SearchHeader';
import AlertWorkflows from 'routes/alerts/components/Workflows';
import { AlertsProvider } from 'routes/alerts/contexts/AlertsContext';
import { ForbiddenPage } from 'routes/forbidden/forbidden';
import { IconButton } from 'ui/buttons/IconButton';
import InformativeAlert from 'ui/InformativeAlert';
import { PageHeader } from 'ui/layouts/PageHeader';
import { DEFAULT_SUGGESTION } from 'ui/SearchBar/search-textfield';

type ListResponse = {
  items: AlertIndexed[];
  offset: number;
  rows: number;
  total: number;
};

type GroupedResponse = {
  counted_total: number;
  items: AlertIndexed[];
  offset: number;
  rows: number;
  tc_start: string;
  total: number;
};

export const PAGE_SIZE = 25;

export const ALERT_SIMPLELIST_ID = 'al.alerts.simplelist';

export const ALERT_STORAGE_KEY = 'alert.search';

export const AlertsPage = memo(() => {
  const { t } = useTranslation('alerts');
  const theme = useTheme();
  const navigate = useAppNavigate<'/alerts'>();
  const search = useAppSearchSnapshot<'/alerts'>();

  const { apiCall } = useMyAPI();
  const { indexes, user: currentUser } = useALContext();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [countedTotal, setCountedTotal] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [scrollReset, setScrollReset] = useState<boolean>(false);

  const prevSearch = useRef<string>(null);

  const isLGDown = useMediaQuery(theme.breakpoints.down('lg'));

  const suggestions = useMemo<IndexDefinition>(() => ({ ...indexes.alert, ...DEFAULT_SUGGESTION }), [indexes]);

  const handleFetch = useCallback(
    (body: typeof search) => {
      if (!currentUser.roles.includes('alert_view')) return;

      const query = body.omit(['tc_start']).toParams();
      query.sort();
      if (query.toString() === prevSearch.current) return;
      prevSearch.current = query.toString();

      const groupBy = query.get('group_by');
      const pathname = groupBy !== '' ? `/api/v4/alert/grouped/${groupBy}/` : `/api/v4/alert/list/`;

      let query2 = body.omit(['refresh']);
      if (Number(query2.get('offset') || 0) === 0) {
        query2 = query2.set(o => ({ ...o, tc_start: '' }));
        setScrollReset(true);
      }

      apiCall<ListResponse | GroupedResponse>({
        url: `${pathname}?${query2.toString()}`,
        method: 'GET',
        onSuccess: ({ api_response }) => {
          if ('tc_start' in api_response) {
            navigate
              .here<'/alerts'>()
              .update(s => ({ ...s, search: { ...s.search, tc_start: api_response.tc_start } }));
          }

          const max = api_response.offset + api_response.rows;
          setAlerts(
            values =>
              [
                ...values.filter(value => value.index < max),
                ...api_response.items.map((item, i) => ({ ...item, id: item.alert_id, index: max + i }))
              ] as AlertItem[]
          );
          setCountedTotal('counted_total' in api_response ? api_response.counted_total : api_response.items.length);
          setTotal(api_response.total);
        },

        onEnter: () => {
          setLoading(true);
        },
        onExit: () => {
          setLoading(false);
          setScrollReset(false);
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser.roles, navigate]
  );

  const handleSelectedItemChange = useCallback(
    (item: Alert) => {
      if (!item) return;
      if (isLGDown) document.getElementById(ALERT_SIMPLELIST_ID).blur();
      navigate.to().create({ route: '/alert/:id', path: { id: item.alert_id }, search: { alert: item as never } });
    },
    [isLGDown, navigate]
  );

  const handleCreateWorkflow = useCallback(() => {
    if (!currentUser.roles.includes('workflow_manage')) return;
    const q = search.get('q');
    const fq = search.get('fq');

    const values = (!q && !fq.length ? [''] : q ? [q] : []).concat(fq);
    const query = values
      .map(v => ([' or ', ' and '].some(a => v.toLowerCase().includes(a)) ? `(${v})` : v))
      .join(' AND ');

    navigate.to().create({ route: '/manage/workflow/create', search: { query } });
  }, [currentUser.roles, navigate, search]);

  useEffect(() => {
    handleFetch(search);
  }, [handleFetch, search]);

  useEffect(() => {
    if (!!search.get('group_by')) return;
    else if (!alerts || alerts.length === 0)
      navigate.here<'/alerts'>().update(s => ({ ...s, search: { ...s.search, tc_start: '' } }));
    else {
      const dates = alerts.map(a => new Date(a.reporting_ts));
      const min = Math.max.apply(null, dates) as string;
      navigate.here<'/alerts'>().update(s => ({
        ...s,
        search: { ...s.search, tc_start: new Date(min).toISOString() }
      }));
    }
  }, [alerts, navigate, search]);

  useEffect(() => {
    const update = ({ detail }: CustomEvent<Alert[]>) => {
      setAlerts(values =>
        values.map(value => {
          const index = detail.findIndex(item => item.alert_id === value.alert_id);
          return index >= 0 ? { ...value, ...detail[index] } : value;
        })
      );
    };

    window.addEventListener('alertUpdate', update);
    return () => {
      window.removeEventListener('alertUpdate', update);
    };
  }, []);

  useEffect(() => {
    const refresh = ({ detail = null }: CustomEvent<InferSearchParamValueMapFromEngine<typeof AlertsRoute.search>>) => {
      navigate.here<'/alerts'>().update(s => ({
        ...s,
        ...detail,
        offset: 0,
        refresh: !s.search.refresh,
        fq: [...(detail?.fq || []), ...s.search.fq]
      }));
    };

    window.addEventListener('alertRefresh', refresh);
    return () => {
      window.removeEventListener('alertRefresh', refresh);
    };
  }, [navigate]);

  if (!currentUser.roles.includes('alert_view')) return <ForbiddenPage />;
  else
    return (
      <AppPageFullWidth>
        <PageHeader
          primary={t('alerts')}
          slotProps={{
            root: { style: { marginBottom: theme.spacing(2) } }
          }}
          actions={
            <>
              <AlertDefaultSearchParameters key="default-search-parameters" />
              <IconButton
                preventRender={!currentUser.roles.includes('workflow_manage')}
                size="large"
                tooltip={t('workflow.tooltip')}
                onClick={handleCreateWorkflow}
              >
                <BiNetworkChart fontSize="x-large" />
                <AddIcon style={{ position: 'absolute', bottom: '10px', right: '6px', fontSize: 'small' }} />
              </IconButton>
            </>
          }
        />

        <SearchHeader
          value={search.toParams()}
          loading={loading}
          suggestions={suggestions}
          pageSize={PAGE_SIZE}
          total={total}
          placeholder={t('search.placeholder')}
          defaultValue={{ rows: 25 }}
          paramKeys={{ query: 'q' }}
          onChange={v =>
            navigate.here().update(s => ({ ...s, search: { ...s.search, ...AlertsRoute.search.delta(v).toObject() } }))
          }
          disableFilterList
          disablePagination
          disableTotalResults
          endAdornment={
            <>
              <AlertFavorites />
              <AlertFilters />
              <AlertWorkflows alerts={alerts} />
            </>
          }
        >
          <AlertSearchResults loading={loading} total={total} />
        </SearchHeader>

        <SimpleList
          id={ALERT_SIMPLELIST_ID}
          disableProgress
          scrollInfinite={0 < countedTotal && countedTotal < total}
          scrollReset={scrollReset}
          scrollLoadNextThreshold={75}
          scrollTargetId="app-scrollct"
          loading={loading}
          items={alerts}
          emptyValue={
            <div style={{ width: '100%' }}>
              <InformativeAlert>
                <AlertTitle>{t('no_alerts_title')}</AlertTitle>
                {t('no_alerts_desc')}
              </InformativeAlert>
            </div>
          }
          onLoadNext={() =>
            navigate
              .here<'/alerts'>()
              .update(s => ({ ...s, search: { ...s.search, offset: s.search.offset + s.search.rows } }))
          }
          onCursorChange={handleSelectedItemChange}
          onItemSelected={handleSelectedItemChange}
          onRenderActions={(item: AlertItem) => <AlertActions alert={item} />}
        >
          {(item: Alert) => <AlertListItem item={item} />}
        </SimpleList>
      </AppPageFullWidth>
    );
});

export const AlertsRoute = createAppRoute({
  component: memo(() => (
    <AlertsProvider>
      <AlertsPage />
    </AlertsProvider>
  )),

  path: '/alerts',
  search: s => ({
    q: s.string(''),
    offset: s.number(0).min(0).source('transient').ephemeral(),
    rows: s.number(PAGE_SIZE).locked().source('transient').ephemeral(),
    sort: s.string('reporting_ts desc'),
    group_by: s.string('file.sha256'),
    fq: s.filters([]),

    no_delay: s.boolean(false),

    tc_start: s.string('').source('transient').ephemeral(),
    tc: s.string('4d'),
    track_total_hits: s.number(null).source('transient').nullable().ephemeral(),
    refresh: s.boolean(false).ephemeral()
  }),

  ancestor: null,
  shortname: () => ({ i18nKey: 'drawer.alerts', ns: 'app' }),
  fullname: () => ({ i18nKey: 'drawer.alerts', ns: 'app' }),
  shorticon: () => <NotificationImportantOutlinedIcon />,
  fullicon: () => <NotificationImportantOutlinedIcon />,

  disabled: () => false,
  forbidden: () => false
});

export type AlertSearchParams = {
  -readonly [K in keyof InferSearchParamValueMapFromEngine<
    typeof AlertsRoute.search
  >]: InferSearchParamValueMapFromEngine<typeof AlertsRoute.search>[K];
};
