/* eslint-disable react-hooks/exhaustive-deps */
import { InfiniteListItem } from 'components/elements/lists/infinite-list';
import useMyAPI from 'components/hooks/useMyAPI';
import { useEffect, useState } from 'react';

export type AlertFile = {
  md5: string;
  name: string;
  sha1: string;
  sha256: string;
  size: number;
  type: string;
};

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

interface UsingAlerts {
  loading: boolean;
  items: AlertItem[];
  onNextPage: (startIndex: number, stopIndex: number) => void;
}

export default function useAlerts(): UsingAlerts {
  const apiCall = useMyAPI();
  const [state, setState] = useState<{ loading: boolean; items: AlertItem[] }>({
    loading: true,
    items: []
  });

  const formatUrl = (startIndex: number, endIndex: number) =>
    `/api/v4/alert/grouped/file.sha256/?offset=${startIndex}&rows=${endIndex - startIndex}&q=&tc=1000d`;

  const onNextPage = (startIndex: number, endIndex: number) => {
    setState({ ...state, loading: true });
    apiCall({
      url: formatUrl(startIndex, endIndex),
      onSuccess: api_data => {
        const { items: _items } = api_data.api_response;
        console.log(_items);
        setState({
          loading: false,
          items: [...state.items, ..._items.map((item, index) => ({ ...item, index: index + startIndex }))]
        });
        // console.log(api_data);
      }
    });
  };

  useEffect(() => {
    onNextPage(0, 25);
  }, []);

  return { ...state, onNextPage };
}
