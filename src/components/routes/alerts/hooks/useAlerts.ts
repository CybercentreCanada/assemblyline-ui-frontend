/* eslint-disable react-hooks/exhaustive-deps */
import { LineItem } from 'components/elements/lists/item/ListItemBase';
import SearchQuery, { SearchFilter, SearchFilterType } from 'components/elements/search/search-query';
import useAppContext from 'components/hooks/useAppContext';
import useMyAPI from 'components/hooks/useMyAPI';
import { ALField } from 'components/hooks/useMyUser';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

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

// Custom Hook implementation for dealing with alerts.
export default function useAlerts(pageSize: number): UsingAlerts {
  const location = useLocation();
  const apiCall = useMyAPI();
  const { indexes: fieldIndexes } = useAppContext();
  const [searchQuery, setSearchQuery] = useState<SearchQuery>(
    new SearchQuery(location.pathname, location.search, pageSize)
  );
  const [fields, setFields] = useState<ALField[]>([]);
  const [statusFilters, setStatusFilters] = useState<SearchFilter[]>([]);
  const [priorityFilters, setPriorityFilters] = useState<SearchFilter[]>([]);
  const [labelFilters, setLabelFilters] = useState<SearchFilter[]>([]);
  const [valueFilters, setValueFilters] = useState<SearchFilter[]>([]);
  const [state, setState] = useState<{
    loading: boolean;
    total: number;
    alerts: AlertItem[];
  }>({
    loading: true,
    total: 0,
    alerts: []
  });

  // parse list of alert result: add an index field.
  const parseResult = (responseItems, offset) => {
    const items = responseItems.map((item, index) => ({ ...item, id: item.alert_id, index: index + offset }));
    return items;
  };

  // format alert api url using specified indexes.
  const buildUrl = () => {
    return `/api/v4/alert/grouped/${searchQuery.getGroupBy()}/?${searchQuery.buildQueryString()}`;
  };

  // Hook API: load/reload all the alerts from start.
  // resets the accumulated list.
  const onLoad = (onComplete?: (success: boolean) => void) => {
    setState({ ...state, loading: true });
    apiCall({
      url: buildUrl(),
      onSuccess: api_data => {
        console.log(api_data.api_response);

        const { items: _items, tc_start: executionTime, total } = api_data.api_response;
        const items = parseResult(_items, 0);
        searchQuery.setTcStart(executionTime);
        setState({
          loading: false,
          total,
          alerts: items
        });
        if (onComplete) {
          onComplete(true);
        }
      },
      onFailure: () => {
        setState({ ...state, loading: false });
        if (onComplete) {
          onComplete(false);
        }
      }
    });
  };

  // Hook API: get alerts for specified index.
  const onLoadMore = (onComplete?: (success: boolean) => void) => {
    console.log('loading more...');

    // Move offset by one increment.
    searchQuery.tickOffset();
    // reference the current offset now incase it changes again before callback is executed
    const _offset = searchQuery.getOffsetNumber();
    setState({ ...state, loading: true });
    apiCall({
      url: buildUrl(),
      onSuccess: api_data => {
        const { items: _items, total } = api_data.api_response;
        const parsedItems = parseResult(_items, _offset);
        setState({
          loading: false,
          total,
          alerts: state.alerts.concat(parsedItems)
        });
        if (onComplete) {
          onComplete(true);
        }
      },
      onFailure: () => {
        setState({ ...state, loading: false });
        if (onComplete) {
          onComplete(false);
        }
      }
    });
  };

  // Fetch the Status Filters.
  const onLoadStatuses = () => {
    apiCall({
      url: '/api/v4/alert/statuses/?offset=0&rows=25&q=&tc=4d&fq=file.sha256:*',
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
      url: '/api/v4/alert/priorities/?offset=0&rows=25&q=&tc=4d&fq=file.sha256:*',
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
      url: '/api/v4/alert/labels/?offset=0&rows=25&q=&tc=4d&fq=file.sha256:*',
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
      url: `/api/v4/alert/statistics/?tc=${searchQuery.getTc()}&q=${searchQuery.getQuery()}`,
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
    onLoad();
    onLoadStatuses();
    onLoadPriorities();
    onLoadLabels();
    onLoadStatisics();
  }, []);

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
