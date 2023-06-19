import { LineItem } from 'commons/addons/lists/item/ListItemBase';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import { ALField, CustomUser } from 'components/hooks/useMyUser';
import SearchQuery, { SearchFilter, SearchFilterType } from 'components/visual/SearchBar/search-query';
import { safeFieldValue, verdictRank } from 'helpers/utils';
import { useCallback, useEffect, useReducer, useState } from 'react';
import { useLocation } from 'react-router-dom';

const DEFAULT_STATE = {
  loading: true,
  total: 0,
  countedTotal: 0,
  alerts: []
};

export interface AlertFile {
  md5: string;
  name: string;
  sha1: string;
  sha256: string;
  size: number;
  type: string;
}

export interface AlertUpdateItem {
  label?: string[];
  owner?: string;
  priority?: string;
  status?: string;
  verdict?: {
    malicious: string[];
    non_malicious: string[];
  };
}

export interface DetailedItem {
  subtype: string;
  type: string;
  value: string;
  verdict: 'safe' | 'info' | 'suspicious' | 'malicious';
}

export interface AlertItem extends LineItem {
  al: {
    attrib: string[];
    av: string[];
    behavior: string[];
    detailed: {
      attack_category: DetailedItem[];
      attack_pattern: DetailedItem[];
      attrib: DetailedItem[];
      av: DetailedItem[];
      behavior: DetailedItem[];
      domain: DetailedItem[];
      heuristic: DetailedItem[];
      ip: DetailedItem[];
      uri: DetailedItem[];
      yara: DetailedItem[];
    };
    domain: string[];
    domain_dynamic: string[];
    domain_static: string[];
    ip: string[];
    ip_dynamic: string[];
    ip_static: string[];
    uri: string[];
    uri_dynamic: string[];
    uri_static: string[];
    request_end_time: string[];
    score: number;
    yara: string[];
  };
  alert_id: string;
  attack: {
    category: string[];
    pattern: string[];
  };
  extended_scan: string;
  classification: string;
  file: AlertFile;
  filtered: boolean;
  label: string[];
  group_count: number;
  heuristic: { name: string[] };
  hint_owner: boolean;
  metadata: {
    [key: string]: any;
  }[];
  owner: string;
  priority: string;
  reporting_ts: string;
  sid: string;
  status: string;
  ts: string;
  type: string;
  verdict: {
    malicious: string[];
    non_malicious: string[];
  };
  workflow_ids: string[];
  workflow_completed: boolean;
}

// The Custom Hook API.
interface UsingAlerts {
  loading: boolean;
  fields: ALField[];
  total: number;
  countedTotal: number;
  alerts: AlertItem[];
  searchQuery: SearchQuery;
  labelFilters: SearchFilter[];
  priorityFilters: SearchFilter[];
  statusFilters: SearchFilter[];
  valueFilters: SearchFilter[];
  updateAlert: (alertIndex: number, alertChanges: AlertUpdateItem) => void;
  updateQuery: (query: SearchQuery) => void;
  onLoad: (onComplete?: (success: boolean) => void) => void;
  onLoadMore: (onComplete?: (success: boolean) => void) => void;
}

interface AlertState {
  loading: boolean;
  total: number;
  countedTotal: number;
  alerts: AlertItem[];
}

interface AlertMessage {
  action: 'set' | 'append' | 'update';
  loading?: boolean;
  total?: number;
  countedTotal?: number;
  alerts?: AlertItem[];
  updateAlert?: {
    alertIndex: number;
    alertChanges: AlertUpdateItem;
  };
}

const alertStateReducer = (state: AlertState, newState: AlertMessage) => {
  const { action, loading, total, countedTotal, alerts, updateAlert } = newState;

  if (action === 'update') {
    const newAlertList = [...state.alerts];
    newAlertList[updateAlert.alertIndex] = { ...newAlertList[updateAlert.alertIndex], ...updateAlert.alertChanges };
    return {
      loading: state.loading,
      total: state.total,
      countedTotal: state.countedTotal,
      alerts: newAlertList
    };
  }

  if (action === 'set') {
    return {
      loading: loading !== undefined ? loading : state.loading,
      total: total !== undefined ? total : state.total,
      countedTotal: countedTotal !== undefined ? countedTotal : state.countedTotal,
      alerts: alerts || state.alerts
    };
  }

  return {
    loading: loading !== undefined ? loading : state.loading,
    total: total !== undefined ? total : state.total,
    countedTotal: countedTotal !== undefined ? state.countedTotal + countedTotal : state.countedTotal,
    alerts: alerts ? state.alerts.concat(alerts) : state.alerts
  };
};

export function detailedItemCompare(a: DetailedItem, b: DetailedItem) {
  const aVerdict = verdictRank(a.verdict);
  const bVerdict = verdictRank(b.verdict);

  if (aVerdict === bVerdict) {
    return a.value < b.value ? -1 : a.value > b.value ? 1 : 0;
  } else {
    return aVerdict < bVerdict ? -1 : 1;
  }
}

// Custom Hook implementation for dealing with alerts.
export default function useAlerts(pageSize: number): UsingAlerts {
  const location = useLocation();
  const { apiCall } = useMyAPI();
  const { user: currentUser } = useAppUser<CustomUser>();
  const { indexes: fieldIndexes } = useALContext();
  const [searchQuery, setSearchQuery] = useState<SearchQuery>(null);
  const [fields, setFields] = useState<ALField[]>([]);
  const [statusFilters, setStatusFilters] = useState<SearchFilter[]>([]);
  const [priorityFilters, setPriorityFilters] = useState<SearchFilter[]>([]);
  const [labelFilters, setLabelFilters] = useState<SearchFilter[]>([]);
  const [valueFilters, setValueFilters] = useState<SearchFilter[]>([]);
  const [state, setState] = useReducer(alertStateReducer, DEFAULT_STATE);

  // parse list of alert result: add an index field.
  const parseResult = (responseItems, offset) => {
    const items = responseItems.map((item, index) => ({ ...item, id: item.alert_id, index: index + offset }));
    return items;
  };

  // format alert api url using specified indexes.
  const buildUrl = useCallback(() => {
    if (searchQuery.getGroupBy()) {
      return `/api/v4/alert/grouped/${searchQuery.getGroupBy()}/?${searchQuery.buildAPIQueryString()}`;
    }
    return `/api/v4/alert/list/?${searchQuery.buildAPIQueryString()}`;
  }, [searchQuery]);

  // Hook API: update an alert in the list
  const updateAlert = useCallback((alertIndex: number, alertChanges: AlertUpdateItem) => {
    setState({ action: 'update', updateAlert: { alertIndex, alertChanges } });
  }, []);

  // Hook API: load/reload all the alerts from start.
  // resets the accumulated list.
  const onLoad = useCallback(
    (onComplete?: (success: boolean) => void) => {
      setState({ action: 'set', loading: true });
      apiCall({
        url: buildUrl(),
        onSuccess: api_data => {
          const { items: _items, tc_start: executionTime, total, counted_total: countedTotal } = api_data.api_response;
          const items = parseResult(_items, 0);

          // Set time constraint start
          if (executionTime) {
            searchQuery.setTcStart(executionTime);
          } else if (!searchQuery.getTcStart() && items.length > 0) {
            searchQuery.setTcStart(items[0].reporting_ts);
          }

          setState({
            action: 'set',
            loading: false,
            total,
            countedTotal: searchQuery.getGroupBy() ? countedTotal : _items.length,
            alerts: items
          });
          if (onComplete) {
            onComplete(true);
          }
        },
        onFailure: () => {
          setState({ action: 'set', loading: false });
          if (onComplete) {
            onComplete(false);
          }
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchQuery]
  );

  // Hook API: get alerts for specified index.
  const onLoadMore = useCallback(
    (onComplete?: (success: boolean) => void) => {
      // Move offset by one increment.
      searchQuery.tickOffset();
      // reference the current offset now incase it changes again before callback is executed
      const _offset = searchQuery.getOffsetNumber();
      setState({ action: 'set', loading: true });
      apiCall({
        url: buildUrl(),
        onSuccess: api_data => {
          const { items: _items, total, counted_total: countedTotal } = api_data.api_response;
          const parsedItems = parseResult(_items, _offset);
          setState({
            action: 'append',
            loading: false,
            total,
            countedTotal: searchQuery.getGroupBy() ? countedTotal : _items.length,
            alerts: parsedItems
          });
          if (onComplete) {
            onComplete(true);
          }
        },
        onFailure: () => {
          setState({ action: 'set', loading: false });
          if (onComplete) {
            onComplete(false);
          }
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchQuery]
  );

  // Fetch the Status Filters.
  const onLoadStatuses = useCallback(() => {
    apiCall({
      url: `/api/v4/alert/statuses/?${searchQuery.buildAPIQueryString()}${
        searchQuery.getGroupBy() ? `&fq=${searchQuery.getGroupBy()}:*` : ''
      }`,
      onSuccess: api_data => {
        const { api_response: statuses } = api_data;
        const msItems: SearchFilter[] = Object.keys(statuses).map((k, i) => ({
          id: i,
          type: SearchFilterType.STATUS,
          label: k,
          value: `status:${k}`,
          other: { count: statuses[k] }
        }));
        setStatusFilters(msItems);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Fetch the Priority Filters.
  const onLoadPriorities = useCallback(() => {
    apiCall({
      url: `/api/v4/alert/priorities/?${searchQuery.buildAPIQueryString()}${
        searchQuery.getGroupBy() ? `&fq=${searchQuery.getGroupBy()}:*` : ''
      }`,
      onSuccess: api_data => {
        const { api_response: priorities } = api_data;
        const msItems: SearchFilter[] = Object.keys(priorities).map((k, i) => ({
          id: i,
          type: SearchFilterType.PRIORITY,
          label: k,
          value: `priority:${k}`,
          other: { count: priorities[k] }
        }));
        setPriorityFilters(msItems);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Fetch the Label Filters.
  const onLoadLabels = useCallback(() => {
    apiCall({
      url: `/api/v4/alert/labels/?${searchQuery.buildAPIQueryString()}${
        searchQuery.getGroupBy() ? `&fq=${searchQuery.getGroupBy()}:*` : ''
      }`,
      onSuccess: api_data => {
        const { api_response: labels } = api_data;
        const msItems: SearchFilter[] = Object.keys(labels).map((k, i) => ({
          id: i,
          type: SearchFilterType.LABEL,
          label: k,
          value: `label:${k}`,
          other: { count: labels[k] }
        }));
        setLabelFilters(msItems);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const onLoadStatisics = useCallback(() => {
    apiCall({
      url: `/api/v4/alert/statistics/?${searchQuery.buildAPIQueryString()}${
        searchQuery.getGroupBy() ? `&fq=${searchQuery.getGroupBy()}:*` : ''
      }`,
      onSuccess: api_data => {
        const { api_response: statistics } = api_data;
        const msItems: SearchFilter[] = [];
        Object.keys(statistics).forEach((k, ki) => {
          const value = statistics[k];
          Object.keys(value).forEach((vk, vki) => {
            const vkv = value[vk];
            msItems.push({
              id: `${ki}.${vki}}`,
              type: SearchFilterType.QUERY,
              label: `${k}:${vk}`,
              value: `${k}:${safeFieldValue(vk)}`,
              other: { count: vkv }
            });
          });
        });
        setValueFilters(msItems);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Load it up!
  useEffect(() => {
    if (searchQuery && currentUser.roles.includes('alert_view')) {
      onLoad();
      onLoadStatuses();
      onLoadPriorities();
      onLoadLabels();
      onLoadStatisics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  useEffect(() => {
    setSearchQuery(new SearchQuery(location.pathname, location.search, pageSize));
  }, [location.pathname, location.search, pageSize]);

  // transform alert fields into array.
  useEffect(() => {
    if (fieldIndexes) {
      const aFields = Object.keys(fieldIndexes.alert).map(name => {
        const o = fieldIndexes.alert[name];
        return { ...o, name };
      });
      setFields(aFields);
    }
  }, [fieldIndexes]);

  // UseAlert Hook API.
  return {
    ...state,
    fields,
    searchQuery,
    statusFilters,
    priorityFilters,
    labelFilters,
    valueFilters,
    updateAlert,
    updateQuery: setSearchQuery,
    onLoad,
    onLoadMore
  };
}
