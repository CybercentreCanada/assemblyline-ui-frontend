/* eslint-disable react-hooks/exhaustive-deps */
import { LineItem } from 'commons/addons/elements/lists/item/ListItemBase';
import useAppContext from 'components/hooks/useAppContext';
import useMyAPI from 'components/hooks/useMyAPI';
import { ALField } from 'components/hooks/useMyUser';
import SearchQuery, { SearchFilter, SearchFilterType } from 'components/visual/SearchBar/search-query';
import { useEffect, useReducer, useState } from 'react';
import { useLocation } from 'react-router-dom';

const DEFAULT_ALERT = {
  reset: false,
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

export interface AlertItem extends LineItem {
  al: {
    attrib: string[];
    av: string[];
    behavior: string[];
    domain: string[];
    domain_dynamic: string[];
    domain_static: string[];
    ip: string[];
    ip_dynamic: string[];
    ip_static: string[];
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
  updateQuery: (query: SearchQuery) => void;
  onLoad: (onComplete?: (success: boolean) => void) => void;
  onLoadMore: (onComplete?: (success: boolean) => void) => void;
}

interface AlertResponse {
  reset: boolean;
  loading: boolean;
  total: number;
  countedTotal: number;
  alerts: AlertItem[];
}

const alertStateReducer = (state, newState) => {
  const { reset, loading, total, countedTotal, alerts } = newState;
  if (reset) return newState;
  return {
    reset: false,
    loading,
    total: total || state.total,
    countedTotal: countedTotal ? state.countedTotal + countedTotal : state.countedTotal,
    alerts: alerts ? state.alerts.concat(alerts) : state.alerts
  };
};

// Custom Hook implementation for dealing with alerts.
export default function useAlerts(pageSize: number): UsingAlerts {
  const location = useLocation();
  const apiCall = useMyAPI();
  const { indexes: fieldIndexes } = useAppContext();
  const [searchQuery, setSearchQuery] = useState<SearchQuery>(null);
  const [fields, setFields] = useState<ALField[]>([]);
  const [statusFilters, setStatusFilters] = useState<SearchFilter[]>([]);
  const [priorityFilters, setPriorityFilters] = useState<SearchFilter[]>([]);
  const [labelFilters, setLabelFilters] = useState<SearchFilter[]>([]);
  const [valueFilters, setValueFilters] = useState<SearchFilter[]>([]);
  const [state, setState] = useReducer(alertStateReducer, DEFAULT_ALERT);

  // parse list of alert result: add an index field.
  const parseResult = (responseItems, offset) => {
    const items = responseItems.map((item, index) => ({ ...item, id: item.alert_id, index: index + offset }));
    return items;
  };

  // format alert api url using specified indexes.
  const buildUrl = () => {
    if (searchQuery.getGroupBy()) {
      return `/api/v4/alert/grouped/${searchQuery.getGroupBy()}/?${searchQuery.buildAPIQueryString()}`;
    }
    return `/api/v4/alert/list/?${searchQuery.buildAPIQueryString()}`;
  };

  // Hook API: load/reload all the alerts from start.
  // resets the accumulated list.
  const onLoad = (onComplete?: (success: boolean) => void) => {
    setState({ loading: true });
    apiCall({
      url: buildUrl(),
      onSuccess: api_data => {
        const { items: _items, tc_start: executionTime, total, counted_total: countedTotal } = api_data.api_response;
        const items = parseResult(_items, 0);
        if (executionTime) searchQuery.setTcStart(executionTime);
        setState({
          reset: true,
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
        setState({ loading: false });
        if (onComplete) {
          onComplete(false);
        }
      }
    });
  };

  // Hook API: get alerts for specified index.
  const onLoadMore = (onComplete?: (success: boolean) => void) => {
    // Move offset by one increment.
    searchQuery.tickOffset();
    // reference the current offset now incase it changes again before callback is executed
    const _offset = searchQuery.getOffsetNumber();
    setState({ loading: true });
    apiCall({
      url: buildUrl(),
      onSuccess: api_data => {
        const { items: _items, total, counted_total: countedTotal } = api_data.api_response;
        const parsedItems = parseResult(_items, _offset);
        setState({
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
        setState({ loading: false });
        if (onComplete) {
          onComplete(false);
        }
      }
    });
  };

  // Fetch the Status Filters.
  const onLoadStatuses = () => {
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
  };

  // Fetch the Priority Filters.
  const onLoadPriorities = () => {
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
  };

  // Fetch the Label Filters.
  const onLoadLabels = () => {
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
  };

  const onLoadStatisics = () => {
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
              value: `${k}:"${vk}"`,
              other: { count: vkv }
            });
          });
        });
        setValueFilters(msItems);
      }
    });
  };

  // Load it up!
  useEffect(() => {
    if (searchQuery) {
      onLoad();
      onLoadStatuses();
      onLoadPriorities();
      onLoadLabels();
      onLoadStatisics();
    }
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
    updateQuery: setSearchQuery,
    onLoad,
    onLoadMore
  };
}
