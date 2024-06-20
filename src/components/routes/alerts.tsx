import { AlertTitle, Button, Divider, Grid, Typography, useMediaQuery, useTheme } from '@mui/material';
import SimpleList from 'commons/addons/lists/simplelist/SimpleList';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageFullWidth from 'commons/components/pages/PageFullWidth';
import PageHeader from 'commons/components/pages/PageHeader';
import useALContext from 'components/hooks/useALContext';
import useDrawer from 'components/hooks/useDrawer';
import useMyAPI from 'components/hooks/useMyAPI';
import type { CustomUser } from 'components/hooks/useMyUser';
import InformativeAlert from 'components/visual/InformativeAlert';
import SearchBar from 'components/visual/SearchBar/search-bar';
import { DEFAULT_SUGGESTION } from 'components/visual/SearchBar/search-textfield';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
import ForbiddenPage from './403';
import AlertActions from './alerts/components/Actions';
import AlertDefaultSearchParameters from './alerts/components/DefaultSearchParameters';
import { AlertFavorites } from './alerts/components/Favorites';
import AlertFilters from './alerts/components/Filters';
import AlertListItem from './alerts/components/ListItem';
import { AlertSearchResults } from './alerts/components/Results';
import AlertWorkflows from './alerts/components/Workflows';
import { AlertsProvider } from './alerts/contexts/AlertsContext';
import { DefaultParamsProvider } from './alerts/contexts/DefaultParamsContext';
import { SearchParamsProvider, useSearchParams } from './alerts/contexts/SearchParamsContext';
import { AlertDetail } from './alerts/detail';
import type { Alert, AlertItem } from './alerts/models/Alert';

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

export const ALERT_SEARCH_FORMAT = {
  fq: 'string[]',
  group_by: 'string',
  offset: 'number',
  q: 'string',
  rows: 'number',
  sort: 'string',
  tc_start: 'string',
  tc: 'string'
} as const;

export type AlertSearchFormat = typeof ALERT_SEARCH_FORMAT;

export const ALERT_SIMPLELIST_ID = 'al.alerts.simplelist';

export const ALERT_STORAGE_KEY = 'alert.search';

export const ALERT_DEFAULT_PARAMS = {
  fq: [],
  group_by: 'file.sha256',
  offset: 0,
  q: '',
  rows: 50,
  sort: 'reporting_ts desc',
  tc_start: '',
  tc: '4d'
} as const;

export const ALERT_DEFAULT_QUERY: string = Object.keys(ALERT_DEFAULT_PARAMS)
  .map(k => `${k}=${ALERT_DEFAULT_PARAMS[k]}`)
  .join('&');

const WrappedAlertsContent = () => {
  const { t } = useTranslation('alerts');
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  const { indexes } = useALContext();
  const { user: currentUser } = useAppUser<CustomUser>();
  const { globalDrawerOpened, setGlobalDrawer } = useDrawer();

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [countedTotal, setCountedTotal] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [scrollReset, setScrollReset] = useState<boolean>(false);

  const queryRef = useRef<string>(null);
  const prevSearch = useRef<string>(null);
  const prevOffset = useRef<number>(null);
  const executionTime = useRef<string>(null);
  const loadingRef = useRef<boolean>(null);

  const isLGDown = useMediaQuery(theme.breakpoints.down('lg'));
  const upMD = useMediaQuery(theme.breakpoints.up('md'));

  const { searchParams, setSearchParams, searchObj, setSearchObj } = useSearchParams<AlertSearchFormat>();

  const suggestions = useMemo<string[]>(
    () =>
      'alert' in indexes
        ? [...Object.keys(indexes.alert).map(name => name), ...DEFAULT_SUGGESTION]
        : DEFAULT_SUGGESTION,
    [indexes]
  );

  const handleClear = useCallback(() => {
    setSearchParams(p => {
      p.delete('q');
      return p;
    });
  }, [setSearchParams]);

  const handleValueChange = (inputValue: string) => {
    queryRef.current = inputValue;
  };

  const handleSearch = useCallback(
    (filterValue: string = '', inputEl: HTMLInputElement = null) => {
      if (queryRef.current !== '') {
        setSearchParams(p => {
          p.set('q', queryRef.current);
          return p;
        });
      } else {
        handleClear();
      }
      if (inputEl) inputEl.focus();
    },
    [handleClear, setSearchParams]
  );

  const handleFetch = useCallback(
    (current: URLSearchParams, offset: number) => {
      // const groupBy = getGroupBy(search, defaultQuery);
      // const pathname = groupBy !== '' ? `/api/v4/alert/grouped/${groupBy}/` : `/api/v4/alert/list/`;

      const pathname = `/api/v4/alert/list/`;

      apiCall({
        url: `${pathname}?${current.toString()}`,
        method: 'GET',
        onSuccess: ({ api_response }: { api_response: ListResponse | GroupedResponse }) => {},
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
    []
  );

  // const handleFetch = useCallback(
  //   (current: SimpleSearchQuery, offset: number) => {
  //     const q = buildSearchQuery({
  //       search: current.toString([]),
  //       singles: ['q', 'no_delay', 'sort', 'tc', 'track_total_hits'],
  //       multiples: ['fq'],
  //       defaultString: defaultQuery
  //     });

  //     q.set('offset', offset);
  //     q.set('rows', DEFAULT_PARAMS.rows);

  //     const search = JSON.stringify(q.getParams());

  //     if (loadingRef.current || search === prevSearch.current) return;
  //     prevSearch.current = search;
  //     prevOffset.current = offset;
  //     loadingRef.current = true;

  //     if (offset === 0) {
  //       setScrollReset(true);
  //       executionTime.current = null;
  //       navigate(`${location.pathname}?${current.getDeltaString()}${location.hash}`);
  //     }

  //     const groupBy = getGroupBy(search, defaultQuery);
  //     const pathname = groupBy !== '' ? `/api/v4/alert/grouped/${groupBy}/` : `/api/v4/alert/list/`;
  //     executionTime.current && q.set('tc_start', executionTime.current);

  //     apiCall({
  //       url: `${pathname}?${q.toString()}`,
  //       method: 'GET',
  //       onSuccess: ({ api_response }: { api_response: ListResponse | GroupedResponse }) => {
  //         setCountedTotal('counted_total' in api_response ? api_response.counted_total : api_response.items.length);
  //         setTotal(api_response.total);

  //         if ('tc_start' in api_response) {
  //           executionTime.current = api_response.tc_start;
  //           current.set('tc_start', executionTime.current);
  //           navigate(`${location.pathname}?${current.getDeltaString()}${location.hash}`, { replace: true });
  //         } else if (!executionTime.current && api_response.items.length > 0) {
  //           executionTime.current = api_response.items[0].reporting_ts;
  //           current.set('tc_start', executionTime.current);
  //           navigate(`${location.pathname}?${current.getDeltaString()}${location.hash}`, { replace: true });
  //         }

  //         const max = api_response.offset + api_response.rows;
  //         setAlerts(values => [
  //           ...values.filter(value => value.index < max),
  //           ...api_response.items.map((item, i) => ({ ...item, id: item.alert_id, index: max + i }))
  //         ]);
  //       },
  //       onEnter: () => {
  //         setLoading(true);
  //       },
  //       onExit: () => {
  //         setLoading(false);
  //         setScrollReset(false);
  //         loadingRef.current = false;
  //       }
  //     });
  //   },
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [defaultQuery, location.hash, location.pathname, navigate]
  // );

  const handleSelectedItemChange = useCallback(
    (item: Alert, index?: number) => {
      if (!item) return;
      // Unfocus the simple list so the drawer does not try to refocus it when closing...
      if (isLGDown) document.getElementById(ALERT_SIMPLELIST_ID).blur();
      navigate(`${location.pathname}${location.search}#${item.alert_id}`);
    },
    [isLGDown, location.pathname, location.search, navigate]
  );

  useEffect(() => {
    if (!globalDrawerOpened && location.hash && location.hash !== '') {
      navigate(`${location.pathname}${location.search ? location.search : ''}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalDrawerOpened]);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substr(1);
      const alert = alerts.find(item => item.alert_id === id);
      setGlobalDrawer(<AlertDetail id={id} alert={alert} inDrawer />, { hasMaximize: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash, setGlobalDrawer]);

  useEffect(() => {
    handleFetch(searchParams, 0);
  }, [handleFetch, searchParams]);

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
        prevOffset.current = null;
        loadingRef.current = null;
        handleFetch(searchParams, 0);
      }, 1000);
    };

    window.addEventListener('alertRefresh', refresh);
    return () => {
      window.removeEventListener('alertRefresh', refresh);
    };
  }, [handleFetch, searchParams]);

  if (!currentUser.roles.includes('alert_view')) return <ForbiddenPage />;
  else
    return (
      <AlertsProvider>
        <PageFullWidth margin={4}>
          <Grid container alignItems="center" paddingBottom={2}>
            <Grid item xs>
              <Typography variant="h4">{t('alerts')}</Typography>
              <Button onClick={() => setSearchObj(p => ({ ...p, offset: p.offset + 10, rows: p.rows + 10 }))}>
                {'click'}
              </Button>
            </Grid>

            <Grid item xs style={{ textAlign: 'right', flex: 0 }}>
              <AlertDefaultSearchParameters />
            </Grid>
          </Grid>
          <PageHeader isSticky>
            <div style={{ paddingTop: theme.spacing(1) }}>
              <SearchBar
                initValue={searchParams.get('q') || ''}
                searching={loading}
                suggestions={suggestions}
                placeholder={t('search.placeholder')}
                onValueChange={handleValueChange}
                onClear={handleClear}
                onSearch={handleSearch}
                extras={
                  <>
                    <Divider
                      orientation="vertical"
                      flexItem
                      style={{ marginLeft: theme.spacing(upMD ? 1 : 0.5), marginRight: theme.spacing(upMD ? 1 : 0.5) }}
                    />
                    <AlertFavorites />
                    <AlertFilters />
                    <AlertWorkflows alerts={alerts} />
                    <div style={{ width: theme.spacing(0.5) }} />
                  </>
                }
              >
                <AlertSearchResults searching={loading} total={total} />
              </SearchBar>
            </div>
          </PageHeader>

          <SimpleList
            id={ALERT_SIMPLELIST_ID}
            disableProgress
            scrollInfinite={countedTotal > 0 && countedTotal < total}
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
            onLoadNext={() => handleFetch(searchParams, prevOffset.current + ALERT_DEFAULT_PARAMS.rows)}
            onCursorChange={handleSelectedItemChange}
            onItemSelected={handleSelectedItemChange}
            onRenderActions={(item: Alert, index?: number) => <AlertActions alert={item} />}
          >
            {(item: Alert) => <AlertListItem item={item} />}
          </SimpleList>
        </PageFullWidth>
      </AlertsProvider>
    );
};

export const AlertsContent = React.memo(WrappedAlertsContent);

const WrappedAlertsPage = () => (
  <DefaultParamsProvider
    defaultValue={ALERT_DEFAULT_QUERY}
    format={ALERT_SEARCH_FORMAT}
    storageKey={ALERT_STORAGE_KEY}
    enforced={['offset', 'rows']}
    ignored={['tc_start']}
  >
    <SearchParamsProvider
      format={ALERT_SEARCH_FORMAT}
      hidden={['rows', 'offset', 'tc_start']}
      enforced={['rows']}
      usingDefaultSearchParams
    >
      <AlertsContent />
    </SearchParamsProvider>
  </DefaultParamsProvider>
);

export const AlertsPage = React.memo(WrappedAlertsPage);
export default AlertsPage;
