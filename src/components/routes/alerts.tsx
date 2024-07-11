import { AlertTitle, Grid, Typography, useMediaQuery, useTheme } from '@mui/material';
import SimpleList from 'commons/addons/lists/simplelist/SimpleList';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageFullWidth from 'commons/components/pages/PageFullWidth';
import useALContext from 'components/hooks/useALContext';
import useDrawer from 'components/hooks/useDrawer';
import useMyAPI from 'components/hooks/useMyAPI';
import type { CustomUser } from 'components/hooks/useMyUser';
import InformativeAlert from 'components/visual/InformativeAlert';
import { DEFAULT_SUGGESTION } from 'components/visual/SearchBar/search-textfield';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
import ForbiddenPage from './403';
import AlertActions from './alerts/components/Actions';
import AlertDefaultSearchParameters from './alerts/components/DefaultSearchParameters';
import AlertFavorites from './alerts/components/Favorites';
import AlertFilters from './alerts/components/Filters';
import AlertListItem from './alerts/components/ListItem';
import { AlertSearchResults } from './alerts/components/Results';
import SearchHeader from './alerts/components/SearchHeader';
import AlertWorkflows from './alerts/components/Workflows';
import { AlertsProvider } from './alerts/contexts/AlertsContext';
import { DefaultParamsProvider } from './alerts/contexts/DefaultParamsContext';
import { SearchParamsProvider, useSearchParams } from './alerts/contexts/SearchParamsContext';
import AlertDetail from './alerts/detail';
import type { Alert, AlertItem } from './alerts/models/Alert';
import type { SearchParams } from './alerts/utils/SearchSchema';

type ListResponse = {
  items: AlertItem[];
  offset: number;
  rows: number;
  total: number;
};

type GroupedResponse = {
  counted_total: number;
  items: AlertItem[];
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
  tc: '4d'
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
  const { globalDrawerOpened, setGlobalDrawer } = useDrawer();
  const { search, setSearchParams, setSearchObject } = useSearchParams<AlertSearchParams>();

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [countedTotal, setCountedTotal] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [scrollReset, setScrollReset] = useState<boolean>(false);

  const prevSearch = useRef<string>(null);
  const loadingRef = useRef<boolean>(null);

  const isLGDown = useMediaQuery(theme.breakpoints.down('lg'));

  const suggestions = useMemo<string[]>(
    () =>
      'alert' in indexes
        ? [...Object.keys(indexes.alert).map(name => name), ...DEFAULT_SUGGESTION]
        : DEFAULT_SUGGESTION,
    [indexes]
  );

  const handleFetch = useCallback(
    (query: URLSearchParams) => {
      const tcStart = query.get('tc_start');
      query.delete('tc_start');
      query.sort();

      if (loadingRef.current || query.toString() === prevSearch.current) return;
      prevSearch.current = query.toString();
      loadingRef.current = true;

      const groupBy = query.get('group_by');
      const pathname = groupBy !== '' ? `/api/v4/alert/grouped/${groupBy}/` : `/api/v4/alert/list/`;

      if (Number(query.get('offset') || 0) === 0) {
        setScrollReset(true);
      } else {
        query.set('tc_start', tcStart);
      }

      apiCall({
        url: `${pathname}?${query.toString()}`,
        method: 'GET',
        onSuccess: ({ api_response }: { api_response: ListResponse | GroupedResponse }) => {
          if ('tc_start' in api_response) {
            query.set('tc_start', api_response.tc_start);
          } else if (!query.get('tc_start') && api_response.items.length > 0) {
            query.set('tc_start', api_response.items[0].reporting_ts);
          }

          const max = api_response.offset + api_response.rows;
          setAlerts(values => [
            ...values.filter(value => value.index < max),
            ...api_response.items.map((item, i) => ({ ...item, id: item.alert_id, index: max + i }))
          ]);
          setCountedTotal('counted_total' in api_response ? api_response.counted_total : api_response.items.length);
          setTotal(api_response.total);
          setSearchParams(query);
        },

        onEnter: () => {
          setLoading(true);
        },
        onExit: () => {
          setLoading(false);
          setScrollReset(false);
          loadingRef.current = false;
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setSearchParams]
  );

  const handleSelectedItemChange = useCallback(
    (item: Alert) => {
      if (!item) return;
      if (isLGDown) document.getElementById(ALERT_SIMPLELIST_ID).blur();
      navigate(`${location.pathname}${location.search}#${item.alert_id}`);
    },
    [isLGDown, location.pathname, location.search, navigate]
  );

  useEffect(() => {
    handleFetch(search.toParams());
  }, [handleFetch, search]);

  useEffect(() => {
    if (!globalDrawerOpened && location.hash && location.hash !== '') {
      navigate(`${location.pathname}${location.search}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalDrawerOpened]);

  useEffect(() => {
    if (location.hash && location.hash !== '') {
      const id = location.hash.substr(1);
      const alert = alerts.find(item => item.alert_id === id);
      setGlobalDrawer(<AlertDetail id={id} alert={alert} inDrawer />, { hasMaximize: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash, setGlobalDrawer]);

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
    const refresh = () => {
      setTimeout(() => {
        prevSearch.current = null;
        loadingRef.current = null;
        handleFetch(search.toParams());
      }, 1000);
    };

    window.addEventListener('alertRefresh', refresh);
    return () => {
      window.removeEventListener('alertRefresh', refresh);
    };
  }, [handleFetch, search]);

  if (!currentUser.roles.includes('alert_view')) return <ForbiddenPage />;
  else
    return (
      <PageFullWidth margin={4}>
        <Grid container alignItems="center" paddingBottom={2}>
          <Grid item xs>
            <Typography variant="h4">{t('alerts')}</Typography>
          </Grid>

          <Grid item xs style={{ textAlign: 'right', flex: 0 }}>
            <AlertDefaultSearchParameters />
          </Grid>
        </Grid>

        <SearchHeader
          value={search.toParams()}
          loading={loading}
          suggestions={suggestions}
          pageSize={PAGE_SIZE}
          total={total}
          placeholder={t('filter')}
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
          <AlertSearchResults searching={loading} total={total} />
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
          onRenderActions={(item: Alert) => <AlertActions alert={item} />}
        >
          {(item: Alert) => <AlertListItem item={item} />}
        </SimpleList>
      </PageFullWidth>
    );
};

export const AlertsContent = React.memo(WrappedAlertsContent);

const WrappedAlertsPage = () => (
  <DefaultParamsProvider
    defaultValue={ALERT_DEFAULT_PARAMS}
    storageKey={ALERT_STORAGE_KEY}
    enforced={['offset', 'rows']}
    ignored={['q', 'no_delay', 'tc_start']}
  >
    <SearchParamsProvider hidden={['rows', 'offset', 'tc_start']} enforced={['rows']} usingDefaultContext>
      <AlertsProvider>
        <AlertsContent />
      </AlertsProvider>
    </SearchParamsProvider>
  </DefaultParamsProvider>
);

export const AlertsPage = React.memo(WrappedAlertsPage);
export default AlertsPage;
