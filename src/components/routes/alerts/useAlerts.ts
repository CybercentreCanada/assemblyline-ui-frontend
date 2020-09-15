/* eslint-disable react-hooks/exhaustive-deps */
import { InfiniteListItem } from 'components/elements/lists/infinite-list';
import useMyAPI from 'components/hooks/useMyAPI';
import { useEffect, useState } from 'react';

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
  onLoad: (startIndex: number, stopIndex: number) => void;
  onLoadMore: (startIndex: number, stopIndex: number) => void;
  onSearch: (query: string) => void;
  onGet: (id: string, onSuccess: (alert: AlertItem) => void) => void;
}

//
// /api/v4/search/fields/alert
// /api/v4/search/alert/

// Custom Hook implementation for dealing with alerts.
export default function useAlerts(): UsingAlerts {
  const apiCall = useMyAPI();
  const [fields, setFields] = useState<ALField[]>([]);
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
  const formatUrl = (startIndex: number, endIndex: number) =>
    `/api/v4/alert/grouped/file.sha256/?offset=${startIndex}&rows=${endIndex - startIndex}&q=`;

  //
  const onLoad = (startIndex: number, endIndex: number) => {
    setState({ ...state, loading: true });
    apiCall({
      url: formatUrl(startIndex, endIndex),
      onSuccess: api_data => {
        const { items: _items, total } = api_data.api_response;
        console.log(_items);
        setState({
          loading: false,
          total,
          items: parseResult(_items, startIndex)
        });
      }
    });
  };

  // Hook API: get alerts for specified index.
  const onLoadMore = (startIndex: number, endIndex: number) => {
    setState({ ...state, loading: true });
    apiCall({
      url: formatUrl(startIndex, endIndex),
      onSuccess: api_data => {
        const { items: _items, total } = api_data.api_response;
        setState({
          loading: false,
          total,
          items: [...state.items, ...parseResult(_items, startIndex)]
        });
      }
    });
  };

  // Hook API: search alert bucket with specified query.
  const onSearch = (query: string) => {
    const url = `/api/v4/search/alert/?query=${query}`;
    apiCall({
      url,
      onSuccess: api_data => {
        const { items, total } = api_data.api_response;
        setState({
          loading: false,
          total,
          items: parseResult(items, 0)
        });
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

  const onFields = () => {
    const url = '/api/v4/search/fields/alert/';
    apiCall({
      url,
      onSuccess: api_data => {
        const rFields = api_data.api_response;
        const aFields = Object.keys(rFields).map(name => {
          const o = rFields[name];
          return { ...o, name };
        });
        setFields(aFields);
      }
    });
  };

  useEffect(() => {
    onLoad(0, 25);
    onFields();
  }, []);

  // UseAlert Hook API.
  return { ...state, fields, onLoad, onLoadMore, onSearch, onGet };
}
