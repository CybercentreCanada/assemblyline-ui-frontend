import { AlertTitle, useMediaQuery, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import SimpleList from 'commons/addons/lists/simplelist/SimpleList';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import { ALField, CustomUser } from 'components/hooks/useMyUser';
import { DEFAULT_QUERY } from 'components/routes/alerts';
import InformativeAlert from 'components/visual/InformativeAlert';
import SearchQuery, { SearchFilter } from 'components/visual/SearchBar/search-query';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, AlertItem } from '../models/Alert';
import { AlertActions } from './Actions';
import AlertListItem from './ListItem';

const useStyles = makeStyles(theme => ({
  desc: {
    transform: 'rotate(0deg)',
    transition: theme.transitions.create('transform', {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.shortest
    })
  },
  asc: {
    transform: 'rotate(180deg)'
  },
  actions: {
    display: 'flex',
    gap: theme.spacing(1),
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    marginTop: theme.spacing(1)
  },
  drawerInner: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(3),
    width: '600px',
    [theme.breakpoints.only('xs')]: {
      width: '100vw'
    }
  }
}));

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

type Props = {};

export const WrappedALertList = ({}: Props) => {
  const { t } = useTranslation('favorites');
  const classes = useStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { apiCall } = useMyAPI();
  const { c12nDef } = useALContext();
  const { user: currentUser } = useAppUser<CustomUser>();

  const isMDUp = useMediaQuery(theme.breakpoints.up('md'));
  const isLGDown = useMediaQuery(theme.breakpoints.down('lg'));

  const { indexes: fieldIndexes } = useALContext();
  const [searchQuery, setSearchQuery] = useState<SearchQuery>(null);
  const [fields, setFields] = useState<ALField[]>([]);
  const [statusFilters, setStatusFilters] = useState<SearchFilter[]>([]);
  const [priorityFilters, setPriorityFilters] = useState<SearchFilter[]>([]);
  const [labelFilters, setLabelFilters] = useState<SearchFilter[]>([]);
  const [valueFilters, setValueFilters] = useState<SearchFilter[]>([]);
  // const [state, setState] = useReducer(alertStateReducer, DEFAULT_STATE);
  const [search, setSearch] = useState<string>(null);

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [countedTotal, setCountedTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [scrollReset, setScrollReset] = useState<boolean>(false);

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

  const handleListFetch = useCallback(
    (props: { offset?: number; rows?: number; tcStart?: string }) => {
      const { offset = 0, rows = PAGE_SIZE, tcStart = null } = props;

      const query = buildSearchQuery(['q', 'no_delay', 'sort', 'tc', 'track_total_hits'], ['fq']);

      query.set('offset', offset);
      query.set('rows', rows);
      tcStart && query.set('tc_start', tcStart);

      apiCall({
        url: `/api/v4/alert/list/?${query.toString()}`,
        method: 'GET',
        onSuccess: ({ api_response }: { api_response: ListResponse }) => {
          setAlerts(values => [
            ...values.filter(value => value.index < offset),
            ...api_response.items.map((item, i) => ({ ...item, id: item.alert_id, index: offset + i }))
          ]);
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
    [buildSearchQuery]
  );

  const handleGroupFetch = useCallback(
    (props: { offset?: number; rows?: number; groupBy?: string; tcStart?: string }) => {
      const { offset = 0, rows = PAGE_SIZE, groupBy = null, tcStart = null } = props;

      const query = buildSearchQuery(['q', 'no_delay', 'sort', 'tc', 'track_total_hits'], ['fq']);

      query.set('offset', offset);
      query.set('rows', rows);
      tcStart && query.set('tc_start', tcStart);

      apiCall({
        url: `/api/v4/alert/grouped/${groupBy}/?${query.toString()}`,
        method: 'GET',
        onSuccess: ({ api_response }: { api_response: GroupedResponse }) => {
          setAlerts(values => [
            ...values.filter(value => value.index < offset),
            ...api_response.items.map((item, i) => ({ ...item, id: item.alert_id, index: offset + i }))
          ]);
          setTotal(api_response.total);
          setCountedTotal(api_response.counted_total);
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
    [buildSearchQuery]
  );

  const handleFetchMore = useCallback(() => {
    console.log('fetch mroe');
  }, []);

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
    const query = new SimpleSearchQuery(location.search, DEFAULT_QUERY);
    const params = query.getParams();
    const groupBy = (
      query.has('group_by') && query.get('group_by', '') === '' ? '' : 'group_by' in params ? params.group_by : ''
    ) as string;

    groupBy !== ''
      ? handleGroupFetch({ offset: 0, rows: PAGE_SIZE, groupBy: groupBy })
      : handleListFetch({ offset: 0, rows: PAGE_SIZE });

    setScrollReset(true);
  }, [handleGroupFetch, handleListFetch, location.search]);

  return (
    <SimpleList
      id={ALERT_SIMPLELIST_ID}
      disableProgress
      scrollInfinite={countedTotal < total}
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
      onLoadNext={() => handleFetchMore()}
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
