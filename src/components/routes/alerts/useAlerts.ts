import { ListItemProps } from 'components/elements/list';
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

export interface AlertItem extends ListItemProps {
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

export default function useAlerts() {
  const apiCall = useMyAPI();
  const [state, setState] = useState<{ loading: boolean; alerts: AlertItem[] }>({ loading: false, alerts: [] });

  useEffect(() => {
    apiCall({
      url: '/api/v4/alert/grouped/<group_by>/',
      method: 'get',
      onSuccess: response => {
        const _alerts = response.api_response.items.map(item => ({ ...item, id: item.sid }));
        setState({ loading: false, alerts: _alerts });
      }
    });
  }, [apiCall, setState]);

  return state;
}
