/* eslint-disable react-hooks/exhaustive-deps */
import { InfiniteListItem } from 'components/elements/lists/infinite-list';
import { MultiSelectItem } from 'components/elements/mui/multiselect';
import SearchQuery from 'components/elements/search/search-query';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface ALField {
  name: string;
  indexed: boolean;
  stored: boolean;
  type: string;
  default: boolean;
  list: boolean;
}

export interface AlertFile {
  md5: string;
  name: string;
  sha1: string;
  sha256: string;
  size: number;
  type: string;
}

export interface AlertItem extends InfiniteListItem {
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
  items: AlertItem[];
  query: SearchQuery;
  labelFilters: any;
  priorityFilters: any;
  statusFilters: any;
  onLoad: () => void;
  onLoadMore: () => void;
  onGet: (id: string, onSuccess: (alert: AlertItem) => void) => void;
}

//
// /api/v4/search/fields/alert.
// /api/v4/search/alert/

// Custom Hook implementation for dealing with alerts.

export default function useAlerts(pageSize): UsingAlerts {
  const location = useLocation();
  const apiCall = useMyAPI();
  const { index: fieldIndexes } = useALContext();
  const [query] = useState<SearchQuery>(new SearchQuery(location.pathname, location.search, pageSize));
  const [fields, setFields] = useState<ALField[]>([]);
  const [statusFilters, setStatusFilters] = useState<MultiSelectItem[]>();
  const [priorityFilters, setPriorityFilters] = useState<MultiSelectItem[]>();
  const [labelFilters, setLabelFilters] = useState<MultiSelectItem[]>();
  const [state, setState] = useState<{ loading: boolean; items: AlertItem[]; total: number }>({
    loading: true,
    total: 0,
    items: []
  });

  // parse list of alert result: add an index field.
  const parseResult = (responseItems, offset) => {
    return responseItems.map((item, index) => ({ ...item, index: index + offset }));
  };

  // format alert api url using specified indexes.
  const buildUrl = () => {
    return `/api/v4/alert/grouped/${query.getGroupBy()}/?${query.buildQueryString()}`;
  };

  // Hook API: load/reload all the alerts from start.
  // resets the accumulated list.
  const onLoad = () => {
    setState({ ...state, loading: true });
    apiCall({
      url: buildUrl(),
      onSuccess: api_data => {
        const { items: _items, total } = api_data.api_response;
        setState({
          loading: false,
          total,
          items: parseResult(_items, query.getOffsetNumber())
        });
      }
    });
  };

  // Hook API: get alerts for specified index.
  const onLoadMore = () => {
    setState({ ...state, loading: true });
    query.tickOffset();
    apiCall({
      url: buildUrl(),
      onSuccess: api_data => {
        const { items: _items, total } = api_data.api_response;
        setState({
          loading: false,
          total,
          items: [...state.items, ...parseResult(_items, query.getOffsetNumber())]
        });
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
          label: `${statuses[k]}x ${k}`,
          value: `status:${k}`
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
          label: `${priorities[k]}x ${k}`,
          value: `priority:${k}`
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
        console.log(labels);
        const msItems = Object.keys(labels).map((k, i) => ({
          id: i,
          label: `${labels[k]}x ${k}`,
          value: `label:${k}`
        }));
        setLabelFilters(msItems);
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

  // By default load 25 items with no search crit.
  useEffect(() => {
    onLoad();
    onLoadStatuses();
    onLoadPriorities();
    onLoadLabels();
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
    query,
    statusFilters,
    priorityFilters,
    labelFilters,
    onLoad,
    onLoadMore,
    onGet
  };
}
