import AddIcon from '@mui/icons-material/Add';
import { AlertTitle, useMediaQuery, useTheme } from '@mui/material';
import { useAppNavigate } from 'core/router';
import { createAppRoute } from 'core/routes';
import SimpleList from 'deprecated/components/lists/simplelist/SimpleList';
import useALContext from 'deprecated/hooks/useALContext';
import useMyAPI from 'deprecated/hooks/useMyAPI';
import type { IndexDefinition } from 'models/api/user';
import type { Alert, AlertIndexed, AlertItem } from 'models/base/alert';
import type { Workflow } from 'models/base/workflow';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BiNetworkChart } from 'react-icons/bi';
import { useLocation } from 'react-router';
import AlertActions from 'routes/alerts/components/Actions';
import AlertDefaultSearchParameters from 'routes/alerts/components/DefaultSearchParameters';
import AlertFavorites from 'routes/alerts/components/Favorites';
import AlertFilters from 'routes/alerts/components/Filters';
import AlertListItem from 'routes/alerts/components/ListItem';
import { AlertSearchResults } from 'routes/alerts/components/Results';
import SearchHeader from 'routes/alerts/components/SearchHeader';
import AlertWorkflows from 'routes/alerts/components/Workflows';
import { AlertsProvider } from 'routes/alerts/contexts/AlertsContext';
import { SearchParamsProvider, useSearchParams } from 'routes/alerts/contexts/SearchParamsContext';
import type { SearchParams } from 'routes/alerts/utils/SearchParams';
import type { SearchResult } from 'routes/alerts/utils/SearchParser';
import { ForbiddenPage } from 'routes/forbidden/forbidden';
import { IconButton } from 'ui/buttons/IconButton';
import InformativeAlert from 'ui/InformativeAlert';
import { PageHeader } from 'ui/layouts/PageHeader';
import { PageFullWidth } from 'ui/pages/PageFullWidth';
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

export const ALERT_DEFAULT_PARAMS = {
  fq: [],
  group_by: 'file.sha256',
  no_delay: false,
  offset: 0,
  q: '',
  rows: PAGE_SIZE,
  sort: 'reporting_ts desc',
  tc_start: '',
  tc: '4d',
  track_total_hits: 10000,
  refresh: false
};

export type AlertSearchParams = SearchParams<typeof ALERT_DEFAULT_PARAMS>;

const WrappedAlertsContent = () => {
  const { t } = useTranslation('alerts');
  const theme = useTheme();
  const location = useLocation();
  const navigate = useAppNavigate();
  const { apiCall } = useMyAPI();
  const { indexes, user: currentUser } = useALContext();
  const { search, setSearchParams, setSearchObject } = useSearchParams<AlertSearchParams>();

  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [countedTotal, setCountedTotal] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [scrollReset, setScrollReset] = useState<boolean>(false);

  const prevSearch = useRef<string>(null);

  const isLGDown = useMediaQuery(theme.breakpoints.down('lg'));

  const suggestions = useMemo<IndexDefinition>(() => ({ ...indexes.alert, ...DEFAULT_SUGGESTION }), [indexes]);

  const handleFetch = useCallback(
    (body: SearchResult<AlertSearchParams>) => {
      if (!currentUser.roles.includes('alert_view')) return;

      const query = body.filter((k, v) => !['tc_start'].includes(k)).toParams();
      query.sort();
      if (query.toString() === prevSearch.current) return;
      prevSearch.current = query.toString();

      const groupBy = query.get('group_by');
      const pathname = groupBy !== '' ? `/api/v4/alert/grouped/${groupBy}/` : `/api/v4/alert/list/`;

      let query2 = body.filter((k, v) => !['refresh'].includes(k));
      if (Number(query2.get('offset') || 0) === 0) {
        query2 = query2.set(o => ({ ...o, tc_start: '' }));
        setScrollReset(true);
      }

      apiCall<ListResponse | GroupedResponse>({
        url: `${pathname}?${query2.toString()}`,
        method: 'GET',
        onSuccess: ({ api_response }) => {
          if ('tc_start' in api_response) {
            setSearchObject(o => ({ ...o, tc_start: api_response.tc_start }));
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
    [currentUser.roles, setSearchObject]
  );

  const handleSelectedItemChange = useCallback(
    (item: Alert) => {
      if (!item) return;
      if (isLGDown) document.getElementById(ALERT_SIMPLELIST_ID).blur();
      navigate.to().create({ route: '/alert/:id', path: { id: item.alert_id } });
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

    const state: Partial<Workflow> = { query };
    navigate.to().create({ route: '/workflow-create', state });
  }, [currentUser.roles, navigate, search]);

  useEffect(() => {
    handleFetch(search);
  }, [handleFetch, search]);

  useEffect(() => {
    if (!!search.get('group_by')) return;
    else if (!alerts || alerts.length === 0) setSearchObject(v => ({ ...v, tc_start: '' }));
    else {
      const dates = alerts.map(a => new Date(a.reporting_ts));
      const min = Math.max.apply(null, dates) as string;
      setSearchObject(o => ({ ...o, tc_start: new Date(min).toISOString() }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alerts]);

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
    const refresh = ({ detail = null }: CustomEvent<AlertSearchParams>) => {
      setSearchObject(o => ({ ...o, ...detail, offset: 0, refresh: !o.refresh, fq: [...(detail?.fq || []), ...o.fq] }));
    };

    window.addEventListener('alertRefresh', refresh);
    return () => {
      window.removeEventListener('alertRefresh', refresh);
    };
  }, [setSearchObject]);

  if (!currentUser.roles.includes('alert_view')) return <ForbiddenPage />;
  else
    return (
      <PageFullWidth margin={4}>
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
          onChange={v => setSearchParams(v)}
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
          onLoadNext={() => setSearchObject(v => ({ ...v, offset: v.offset + v.rows }))}
          onCursorChange={handleSelectedItemChange}
          onItemSelected={handleSelectedItemChange}
          onRenderActions={(item: AlertItem) => <AlertActions alert={item} />}
        >
          {(item: Alert) => <AlertListItem item={item} />}
        </SimpleList>
      </PageFullWidth>
    );
};

export const AlertsContent = React.memo(WrappedAlertsContent);

export const WrappedAlertsPage = memo(() => (
  <SearchParamsProvider
    defaultValue={ALERT_DEFAULT_PARAMS}
    hidden={['rows', 'offset', 'tc_start', 'track_total_hits']}
    enforced={['rows']}
  >
    <AlertsProvider>
      <AlertsContent />
    </AlertsProvider>
  </SearchParamsProvider>
));

export const AlertsRoute = createAppRoute({
  component: WrappedAlertsPage,
  path: '/alerts'
});
