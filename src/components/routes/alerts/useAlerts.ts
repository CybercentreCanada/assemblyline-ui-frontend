import { InfiniteListItem } from 'components/elements/lists/infinite-list';
import { ListItemProps } from 'components/elements/lists/list';
import { VirtualizedListItem } from 'components/elements/lists/virtualized-list';
import { useEffect, useState } from 'react';

export type AlertFile = {
  md5: string;
  name: string;
  sha1: string;
  sha256: string;
  size: number;
  type: string;
};

export interface AlertItem extends ListItemProps, VirtualizedListItem, InfiniteListItem {
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
  onNextPage: (startIndex: number, stopIndex: number) => Promise<any>;
}

export default function useAlerts(): UsingAlerts {
  const [state, setState] = useState<{ loading: boolean; items: AlertItem[] }>({
    loading: true,
    items: []
  });

  useEffect(() => {
    fetch('/api/v4/alert/grouped/<group_by>/')
      .then(res => res.json())
      .then(api_data => {
        const _sliced = api_data.api_response.items.slice(0, 12);

        _sliced.forEach((item, i) => {
          // eslint-disable-next-line no-param-reassign
          item.id = i;
        });

        setState({ loading: false, items: _sliced });
      });
  }, []);

  const onNextPage = (startIndex: number, stopIndex: number): Promise<any> => {
    console.log(`fetching[${startIndex},${stopIndex}]`);
    setState({ ...state, loading: true });
    return fetch('/api/v4/alert/grouped/<group_by>/')
      .then(res => res.json())
      .then(api_data => {
        const size = stopIndex - startIndex;

        const _sliced = api_data.api_response.items.slice(0, size);

        _sliced.forEach((item, i) => {
          // eslint-disable-next-line no-param-reassign
          item.id = startIndex + i;
        });

        setTimeout(() => {
          setState({ loading: false, items: [...state.items, ..._sliced] });
        }, 1000);
      });
  };

  return { ...state, onNextPage };
}
