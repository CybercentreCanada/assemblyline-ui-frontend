import { Box } from '@material-ui/core';
import PageHeader from 'commons/components/layout/pages/PageHeader';
import useMyAPI from 'components/hooks/useMyAPI';
import React, { useEffect, useState } from 'react';
import AlertListDetail from './list/alert-list-detail';

export type AlertFile = {
  md5: string;
  name: string;
  sha1: string;
  sha256: string;
  size: number;
  type: string;
};

export type AlertItem = {
  sid: string;
  alert_id: string;
  type: string;
  reporting_ts: string;
  label: string[];
  priority: string;
  status: string;
  file: AlertFile;
  owner: string;
  group_count: number;
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
};

const Alerts: React.FC = () => {
  const apiCall = useMyAPI();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  useEffect(() => {
    apiCall({
      url: '/api/v4/alert/grouped/<group_by>/',
      method: 'get',
      onSuccess: response => {
        console.log('sucess');
        console.log(response.api_response.items);
        setAlerts(response.api_response.items);
      },
      onEnter: () => console.log('enter'),
      onExit: () => console.log('exit')
    });
  }, [apiCall, setAlerts]);

  return (
    <Box>
      <PageHeader mode="provided" title={<h2>{`Total: ${alerts.length}`}</h2>} />
      {/* <Divider /> */}
      {/* <AlertGrid items={alerts} /> */}
      {/* <AlertList items={alerts} /> */}
      <AlertListDetail items={alerts} />
    </Box>
  );
};

export default Alerts;
