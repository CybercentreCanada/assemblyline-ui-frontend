import { useMediaQuery, useTheme } from '@material-ui/core';
import useMyAPI from 'components/hooks/useMyAPI';
import React, { useEffect, useState } from 'react';
import SplitPanel from './panels/split-panel2';
import Viewport from './panels/viewport';

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
  classification: string;
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
  const theme = useTheme();
  const isLTELarge = useMediaQuery(theme.breakpoints.up('lg'));
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  useEffect(() => {
    apiCall({
      url: '/api/v4/alert/grouped/<group_by>/',
      method: 'get',
      onSuccess: response => {
        // console.log('sucess');
        // console.log(response.api_response.items);
        setAlerts(response.api_response.items);
      }
      // onEnter: () => console.log('enter'),
      // onExit: () => console.log('exit')
    });
  }, [apiCall, setAlerts]);

  // return <Box>{isLTELarge ? <AlertsSplitPanel items={alerts} /> : <AlertListDetail items={alerts} />}</Box>;
  // return <AlertsSplitPanel items={alerts} />;.
  return (
    <Viewport>
      <SplitPanel />
    </Viewport>
  );
};

export default Alerts;
