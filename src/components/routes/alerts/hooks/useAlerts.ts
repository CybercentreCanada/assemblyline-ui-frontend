/* eslint-disable react-hooks/exhaustive-deps */
import { MetaListItem } from 'components/elements/lists/metalist/metalist';
import MetaListBuffer from 'components/elements/lists/metalist/metalist-buffer';
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

export interface AlertItem extends MetaListItem {
  sid: string;
  alert_id: string;
  type: string;
  reporting_ts: string;
  label: string[];
  priority: string;
  status: string;
  file: AlertFile;
  owner: string;
  hint_owner: boolean;
  group_count: number;
  classification: string;
  filtered: boolean;
  heuristic: { name: string[] };
  metadata: {
    [key: string]: any;
  }[];
  attack: {
    category: string;
    pattern: string[];
  };
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
}

// The Custom Hook API.
interface UsingAlerts {
  loading: boolean;
  fields: ALField[];
  total: number;
  buffer: MetaListBuffer;
  query: SearchQuery;
  labelFilters: SearchFilter[];
  priorityFilters: SearchFilter[];
  statusFilters: SearchFilter[];
  valueFilters: SearchFilter[];
  onLoad: (onSuccess?: () => void) => void;
  onLoadMore: (onSuccess?: () => void) => void;
  onGet: (id: string, onSuccess: (alert: AlertItem) => void) => void;
}

// Custom Hook implementation for dealing with alerts.
export default function useAlerts(pageSize: number): UsingAlerts {
  const location = useLocation();
  const apiCall = useMyAPI();
  const { indexes: fieldIndexes } = useAppContext();
  const [query] = useState<SearchQuery>(new SearchQuery(location.pathname, location.search, pageSize));
  const [fields, setFields] = useState<ALField[]>([]);
  const [statusFilters, setStatusFilters] = useState<SearchFilter[]>([]);
  const [priorityFilters, setPriorityFilters] = useState<SearchFilter[]>([]);
  const [labelFilters, setLabelFilters] = useState<SearchFilter[]>([]);
  const [valueFilters, setValueFilters] = useState<SearchFilter[]>([]);
  const [state, setState] = useState<{ loading: boolean; buffer: MetaListBuffer; total: number }>({
    loading: true,
    total: 0,
    // items: [],
    buffer: new MetaListBuffer()
  });

  // parse list of alert result: add an index field.
  const parseResult = (responseItems, offset) => {
    const items = responseItems.map((item, index) => ({ ...item, id: item.alert_id, index: index + offset }));
    return items;
  };

  // format alert api url using specified indexes.
  const buildUrl = () => {
    return `/api/v4/alert/grouped/${query.getGroupBy()}/?${query.buildQueryString()}`;
  };

  // Hook API: load/reload all the alerts from start.
  // resets the accumulated list.
  const onLoad = (onSuccess?: () => void) => {
    setState({ ...state, loading: true });
    apiCall({
      url: buildUrl(),
      onSuccess: api_data => {
        const { items: _items, total } = api_data.api_response;
        setState({
          loading: false,
          total,
          buffer: new MetaListBuffer().push(parseResult(_items, 0))
        });
        if (onSuccess) {
          onSuccess();
        }
      }
    });
  };

  // Hook API: get alerts for specified index.
  const onLoadMore = (onSuccess?: () => void) => {
    console.log('loading more...');
    // Move offset by one increment.
    query.tickOffset();
    // reference the current offset now incase it changes again before callback is executed
    const _offset = query.getOffsetNumber();
    setState({ ...state, loading: true });
    apiCall({
      url: buildUrl(),
      onSuccess: api_data => {
        const { items: _items, total } = api_data.api_response;
        setState({
          loading: false,
          total,
          buffer: state.buffer.push(parseResult(_items, _offset)).build()
        });
        if (onSuccess) {
          onSuccess();
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
        const msItems = Object.keys(statuses).map((k, i) => ({
          id: i,
          type: SearchFilterType.STATUS,
          label: k,
          value: `status:${k}`,
          object: { count: statuses[k] }
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
        const msItems = Object.keys(priorities).map((k, i) => ({
          id: i,
          type: SearchFilterType.PRIORITY,
          label: k,
          value: `priority:${k}`,
          object: { count: priorities[k] }
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
        const msItems = Object.keys(labels).map((k, i) => ({
          id: i,
          type: SearchFilterType.LABEL,
          label: k,
          value: `label:${k}`,
          object: { count: labels[k] }
        }));
        setLabelFilters(msItems);
      }
    });
  };

  const onLoadStatisics = () => {
    apiCall({
      url: `/api/v4/alert/statistics/?tc=${query.getTc()}&q=${query.getQuery()}`,
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
              object: { count: vkv }
            });
          });
        });
        setValueFilters(msItems);
      }
    });
  };

  // Hook API: fetch the alert for the specified alert_id.
  const onGet = (id: string, onSuccess: (alert: AlertItem) => void) => {
    const url = `/api/v4/alert/${id}/`;
    apiCall({
      url,
      onSuccess: api_data => {
        onSuccess(api_data.api_response);
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

  // console.log(configuration);

  // UseAlert Hook API.
  return {
    ...state,
    fields,
    query,
    statusFilters,
    priorityFilters,
    labelFilters,
    valueFilters,
    onLoad,
    onLoadMore,
    onGet
  };
}
