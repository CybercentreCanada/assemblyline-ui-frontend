import Book from 'components/elements/lists/booklist/book';
/* eslint-disable react-hooks/exhaustive-deps */
import { MetaListItem } from 'components/elements/lists/metalist/metalist';
import MetaListBuffer from 'components/elements/lists/metalist/metalist-buffer';
import SearchQuery, { SearchFilter, SearchFilterType } from 'components/elements/search/search-query';
import useAppContext from 'components/hooks/useAppContext';
import useMyAPI from 'components/hooks/useMyAPI';
import { ALField } from 'components/hooks/useMyUser';
import { useCallback, useEffect, useState } from 'react';
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
  book: Book;
  query: SearchQuery;
  labelFilters: SearchFilter[];
  priorityFilters: SearchFilter[];
  statusFilters: SearchFilter[];
  valueFilters: SearchFilter[];
  updateBook: (book: Book) => void;
  onLoad: (onSuccess?: () => void) => void;
  onLoadMore: (onSuccess?: () => void) => void;
  onGet: (id: string) => Promise<AlertItem>;
  onApplyWorflowAction: (status: string, selectedPriority: string, selectedLabels: string[]) => Promise<void>;
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
  const [state, setState] = useState<{
    loading: boolean;
    loadStartTime: string;
    total: number;
    buffer: MetaListBuffer;
    book: Book;
  }>({
    loading: true,
    loadStartTime: null,
    total: 0,
    // items: [],
    buffer: new MetaListBuffer(),
    book: new Book([], pageSize)
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
        console.log(api_data.api_response);

        const { items: _items, tc_start: loadStartTime, total } = api_data.api_response;
        const items = parseResult(_items, 0);
        setState({
          loading: false,
          loadStartTime,
          total,
          buffer: new MetaListBuffer().push(items),
          book: new Book(items, pageSize)
        });
        if (onSuccess) {
          onSuccess();
        }
      },
      onFailure: () => setState({ ...state, loading: false })
    });
  };

  // Hook API: get alerts for specified index.
  const onLoadMore = (onSuccess?: () => void) => {
    // Move offset by one increment.
    query.tickOffset();
    // reference the current offset now incase it changes again before callback is executed
    const _offset = query.getOffsetNumber();
    setState({ ...state, loading: true });
    apiCall({
      url: buildUrl(),
      onSuccess: api_data => {
        const { items: _items, total } = api_data.api_response;
        const parsedItems = parseResult(_items, _offset);
        setState({
          loading: false,
          loadStartTime: state.loadStartTime,
          total,
          buffer: state.buffer.push(parsedItems).build(),
          book: state.book.addAll(parsedItems)
        });
        if (onSuccess) {
          onSuccess();
        }
      },
      onFailure: () => setState({ ...state, loading: false })
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
  const onGet = useCallback((id: string) => {
    return new Promise<AlertItem>((resolve, reject) => {
      const url = `/api/v4/alert/${id}/`;
      apiCall({
        url,
        onSuccess: api_data => {
          resolve(api_data.api_response);
        },
        onFailure: () => reject()
      });
    });
  }, []);

  // Hook API:
  const onApplyWorflowAction = async (
    selectedStatus: string,
    selectedPriority: string,
    selectedLabels: string[]
  ): Promise<any> => {
    // https://192.168.0.13.nip.io:8443/api/v4/alert/priority/batch/?q=testing_constantly.pdf&tc=4d&tc_start=2020-10-08T17:04:38.359618Z
    const statusPromise = new Promise((resolve, reject) => {
      if (selectedStatus) {
        apiCall({
          url: `/api/v4/alert/status/batch/?${query.buildQueryString()}&tc_start=${state.loadStartTime}`,
          method: 'post',
          body: selectedStatus,
          onSuccess: api_data => {
            resolve(true);
          },
          onFailure: () => resolve(false)
        });
      } else {
        resolve(false);
      }
    });

    // https://192.168.0.13.nip.io:8443/api/v4/alert/priority/batch/?q=testing_constantly.pdf&tc=4d&tc_start=2020-10-08T17:04:38.359618Z
    const priorityPromise = new Promise((resolve, reject) => {
      if (selectedPriority) {
        apiCall({
          url: `/api/v4/alert/priority/batch/?${query.buildQueryString()}&tc_start=${state.loadStartTime}`,
          method: 'post',
          body: selectedPriority,
          onSuccess: api_data => {
            resolve(true);
          },
          onFailure: () => resolve(false)
        });
      } else {
        resolve(false);
      }
    });

    // https://192.168.0.13.nip.io:8443/api/v4/alert/status/batch/?q=testing_constantly.pdf&tc=4d&tc_start=2020-10-08T17:04:38.359618Z
    const labelPromise = new Promise((resolve, reject) => {
      if (selectedLabels && selectedLabels.length > 0) {
        apiCall({
          url: `/api/v4/alert/label/batch/?${query.buildQueryString()}&tc_start=${state.loadStartTime}`,
          method: 'post',
          body: selectedLabels,
          onSuccess: api_data => {
            resolve(api_data);
          },
          onFailure: () => resolve(false)
        });
      } else {
        resolve();
      }
    });

    return Promise.all([statusPromise, priorityPromise, labelPromise]);
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
    query,
    statusFilters,
    priorityFilters,
    labelFilters,
    valueFilters,
    updateBook: (book: Book) => setState({ ...state, book }),
    onLoad,
    onLoadMore,
    onGet,
    onApplyWorflowAction
  };
}
