import { AlertTitle, useMediaQuery, useTheme } from '@mui/material';
import SimpleList from 'commons/addons/lists/simplelist/SimpleList';
import useMyAPI from 'components/hooks/useMyAPI';
import { DEFAULT_QUERY } from 'components/routes/alerts';
import InformativeAlert from 'components/visual/InformativeAlert';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, AlertItem } from '../models/Alert';
import { AlertActions } from './Actions';
import AlertListItem from './ListItem';

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

export const ALERT_SIMPLELIST_ID = 'al.alerts.simplelist';

const PAGE_SIZE = 50;

export const WrappedALertList = () => {
  const { t } = useTranslation('alerts');
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { apiCall } = useMyAPI();

  const isLGDown = useMediaQuery(theme.breakpoints.down('lg'));

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [countedTotal, setCountedTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [scrollReset, setScrollReset] = useState<boolean>(false);

  const nextOffset = useRef<number>(0);
  const executionTime = useRef<string>('');
  const loadingRef = useRef<boolean>(false);

  const buildSearchQuery = useCallback(
    (singles: string[] = [], multiples: string[] = []): SimpleSearchQuery => {
      const defaults = new SimpleSearchQuery(DEFAULT_QUERY);
      const current = new SimpleSearchQuery(location.search);
      const query = new SimpleSearchQuery('');

      singles.forEach(key => {
        const value = current.get(key);
        const other = defaults.get(key);
        if (value && value !== '') query.set(key, value);
        else if (!current.has(key) && other && other !== '') query.set(key, other);
      });

      multiples.forEach(key => {
        [...defaults.getAll(key, []), ...current.getAll(key, [])].forEach(value => query.add(key, value));
      });

      return query;
    },
    [location.search]
  );

  const handleFetch = useCallback(
    (search: string) => {
      if (loadingRef.current) return;
      loadingRef.current = true;

      const current = new SimpleSearchQuery(search, DEFAULT_QUERY);
      const params = current.getParams();
      const groupBy = (
        current.has('group_by') && current.get('group_by', '') === '' ? '' : 'group_by' in params ? params.group_by : ''
      ) as string;

      const pathname = groupBy !== '' ? `/api/v4/alert/grouped/${groupBy}/` : `/api/v4/alert/list/`;
      const query = buildSearchQuery(['q', 'no_delay', 'sort', 'tc', 'track_total_hits'], ['fq']);

      query.set('offset', nextOffset.current);
      query.set('rows', PAGE_SIZE);
      executionTime.current && query.set('tc_start', executionTime.current);

      apiCall({
        url: `${pathname}?${query.toString()}`,
        method: 'GET',
        onSuccess: ({ api_response }: { api_response: ListResponse | GroupedResponse }) => {
          setCountedTotal('counted_total' in api_response ? api_response.counted_total : api_response.items.length);

          if ('tc_start' in api_response) {
            executionTime.current = api_response.tc_start;
          } else if (!executionTime.current && api_response.items.length > 0) {
            executionTime.current = api_response.items[0].reporting_ts;
          }

          nextOffset.current = api_response.offset + api_response.rows;

          setAlerts(values => [
            ...values.filter(value => value.index < nextOffset.current),
            ...api_response.items.map((item, i) => ({ ...item, id: item.alert_id, index: nextOffset.current + i }))
          ]);
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
    [buildSearchQuery, location.search]
  );

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
    nextOffset.current = 0;
    executionTime.current = null;
    setScrollReset(true);
    setAlerts([]);

    handleFetch(location.search);
  }, [handleFetch, location.search]);

  return (
    <SimpleList
      id={ALERT_SIMPLELIST_ID}
      disableProgress
      scrollInfinite={countedTotal > 0}
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
      onLoadNext={() => handleFetch(location.search)}
      onCursorChange={handleSelectedItemChange}
      onItemSelected={handleSelectedItemChange}
      onRenderActions={(item: Alert, index?: number) => <AlertActions />}
    >
      {(item: Alert) => <AlertListItem item={item} />}
    </SimpleList>
  );
};

export const ALertList = React.memo(WrappedALertList);
export default ALertList;
