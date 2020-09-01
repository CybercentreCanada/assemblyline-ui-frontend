import { Box, Divider, useTheme } from '@material-ui/core';
import useMyAPI from 'components/hooks/useMyAPI';
import React, { useEffect, useState } from 'react';
import AlertsHeader from './list/alerts-header';
import AlertsSplitPanel from './list/alerts-split-panel';

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
  const theme = useTheme();
  const apiCall = useMyAPI();
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

  // return (

  // return <AlertGrid items={alerts} />;..
  return (
    <Box display="flex" flexDirection="row">
      <Box flex="0 0 auto" mt={2} display="flex" flexDirection="row">
        <Box mr={2}>
          <AlertsHeader />
        </Box>
        <Divider orientation="vertical" />
      </Box>
      <Box ml={2} flex="1 1 auto">
        <AlertsSplitPanel items={alerts} />
      </Box>
    </Box>
  );
  // return (
  //   <Viewport>
  //     <SplitPanel
  //       leftInitWidthPerc={15}
  //       left={
  //         <Box mt={2}>
  //           <AlertsHeader />
  //         </Box>
  //       }
  //       right={
  //         <Box ml={2}>
  //           <AlertsSplitPanel items={alerts} />
  //         </Box>
  //       }
  //     />
  //   </Viewport>
  // );
  // <Box>
  //   <Box mt={theme.spacing(0.1)} mb={theme.spacing(0.1)}>
  //   </Box>
  //   <AlertsSplitPanel items={alerts} />
  // </Box>
  // );
};

export default Alerts;
