import AddIcon from '@mui/icons-material/Add';
import { AlertTitle, Grid, IconButton, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import SimpleList from 'commons/addons/lists/simplelist/SimpleList';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageFullWidth from 'commons/components/pages/PageFullWidth';
import useALContext from 'components/hooks/useALContext';
import useDrawer from 'components/hooks/useDrawer';
import useMyAPI from 'components/hooks/useMyAPI';
import type { Alert, AlertIndexed, AlertItem } from 'components/models/base/alert';
import type { Workflow } from 'components/models/base/workflow';
import type { CustomUser } from 'components/models/ui/user';
import InformativeAlert from 'components/visual/InformativeAlert';
import { DEFAULT_SUGGESTION } from 'components/visual/SearchBar/search-textfield';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BiNetworkChart } from 'react-icons/bi';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
import ForbiddenPage from './403';
import AlertActions from './alerts/components/Actions';
import { AlertDefaultSearchParameters } from './alerts/components/DefaultSearchParameters';
import AlertFavorites from './alerts/components/Favorites';
import AlertFilters from './alerts/components/Filters';
import AlertListItem from './alerts/components/ListItem';
import { AlertSearchResults } from './alerts/components/Results';
import SearchHeader from './alerts/components/SearchHeader';
import AlertWorkflows from './alerts/components/Workflows';
import { AlertsProvider } from './alerts/contexts/AlertsContext';
import { SearchParamsProvider, useSearchParams } from './alerts/contexts/SearchParamsContext';
import AlertDetail from './alerts/detail';
import type { SearchParams } from './alerts/utils/SearchParams';
import type { SearchResult } from './alerts/utils/SearchParser';
import { WorkflowCreate } from './manage/workflows/create';

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
  const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  const { indexes } = useALContext();
  const { user: currentUser } = useAppUser<CustomUser>();
  const { globalDrawerOpened, setGlobalDrawer, closeGlobalDrawer } = useDrawer();
  const { search, setSearchParams, setSearchObject } = useSearchParams<AlertSearchParams>();

  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [countedTotal, setCountedTotal] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [scrollReset, setScrollReset] = useState<boolean>(false);

  const prevSearch = useRef<string>(null);

  const isLGDown = useMediaQuery(theme.breakpoints.down('lg'));

  const suggestions = useMemo<string[]>(
    () =>
      'alert' in indexes
        ? [...Object.keys(indexes.alert).map(name => name), ...DEFAULT_SUGGESTION]
        : DEFAULT_SUGGESTION,
    [indexes]
  );

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
      navigate(`${location.pathname}${location.search}#/alert/${item.alert_id}`);
    },
    [isLGDown, location.pathname, location.search, navigate]
  );

  const handleCreateWorkflow = useCallback(() => {
    if (!currentUser.roles.includes('workflow_manage')) return;
    const q = search.get('q');
    const fq = search.get('fq');

    const values = (!q && !fq.length ? ['*'] : q ? [q] : []).concat(fq);
    const query = values
      .map(v => ([' or ', ' and '].some(a => v.toLowerCase().includes(a)) ? `(${v})` : v))
      .join(' AND ');

    const state: Partial<Workflow> = { query };
    navigate(`${location.pathname}${location.search}#/workflow/`, { state });
  }, [currentUser.roles, location.pathname, location.search, navigate, search]);

  useEffect(() => {
    handleFetch(search);
  }, [handleFetch, search]);

  useEffect(() => {
    if (alerts.length && !globalDrawerOpened && location.hash) {
      navigate(`${location.pathname}${location.search}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalDrawerOpened]);

  useEffect(() => {
    const url = new URL(`${window.location.origin}${location.hash.slice(1)}`);
    if (url.pathname.startsWith('/alert/')) {
      const id = url.pathname.slice('/alert/'.length);
      const alert = alerts.find(item => item.alert_id === id);
      setGlobalDrawer(<AlertDetail id={id} alert={alert} inDrawer />, { hasMaximize: true });
    } else if (url.pathname.startsWith('/workflow/')) {
      setGlobalDrawer(<WorkflowCreate id={url.pathname.slice('/workflow/'.length)} onClose={closeGlobalDrawer} />);
    } else {
      closeGlobalDrawer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alerts, closeGlobalDrawer, location.hash, setGlobalDrawer]);

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
        <Grid container alignItems="center" paddingBottom={2}>
          <Grid item xs>
            <Typography variant="h4">{t('alerts')}</Typography>
          </Grid>

          <Grid item xs style={{ display: 'flex', textAlign: 'right', flex: 0 }}>
            <AlertDefaultSearchParameters />
            {currentUser.roles.includes('workflow_manage') && (
              <Tooltip title={t('workflow.tooltip')}>
                <div>
                  <IconButton size="large" onClick={handleCreateWorkflow}>
                    <BiNetworkChart fontSize="x-large" />
                    <AddIcon style={{ position: 'absolute', bottom: '10px', right: '6px', fontSize: 'small' }} />
                  </IconButton>
                </div>
              </Tooltip>
            )}
          </Grid>
        </Grid>

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

const WrappedAlertsPage = () => (
  <SearchParamsProvider
    defaultValue={ALERT_DEFAULT_PARAMS}
    hidden={['rows', 'offset', 'tc_start', 'track_total_hits']}
    enforced={['rows']}
  >
    <AlertsProvider>
      <AlertsContent />
    </AlertsProvider>
  </SearchParamsProvider>
);

export const AlertsPage = React.memo(WrappedAlertsPage);
export default AlertsPage;
