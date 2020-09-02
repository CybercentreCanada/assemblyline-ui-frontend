import { Box, Drawer, useTheme } from '@material-ui/core';
import useMyAPI from 'components/hooks/useMyAPI';
import React, { useEffect, useState } from 'react';
import AlertsFilters from './list/alerts-filters';
import AlertsHeader from './list/alerts-header';
import AlertsSplitPanel from './list/alerts-split-panel';
import { ListItemProps } from './panels/list';

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
}

const Alerts: React.FC = () => {
  const theme = useTheme();
  const apiCall = useMyAPI();
  const [alerts, setAlerts] = useState<{ loading: boolean; filtered: AlertItem[]; original: AlertItem[] }>({
    loading: true,
    filtered: [],
    original: []
  });
  const [drawer, setDrawer] = useState<{ open: boolean; type: 'filter' }>({ open: false, type: null });

  useEffect(() => {
    apiCall({
      url: '/api/v4/alert/grouped/<group_by>/',
      method: 'get',
      onSuccess: response => {
        // console.log('sucess');
        // console.log(response.api_response.items);
        const _alerts = response.api_response.items.map(item => ({ ...item, id: item.sid }));
        setAlerts({ loading: false, filtered: _alerts, original: _alerts });
      }
      // onEnter: () => console.log('enter'),
      // onExit: () => console.log('exit')
    });
  }, [apiCall, setAlerts]);

  // const actions: PageHeaderAction[] = [
  //   {
  //     action: () => console.log(''),
  //     icon: <FilterListIcon />,
  //     btnProp: {
  //       title: 'Filter',
  //       color: 'primary',
  //       size: 'small',
  //       variant: 'contained'
  //     }
  //   },
  //   {
  //     action: () => console.log(''),
  //     icon: <AddIcon />,
  //     btnProp: {
  //       title: 'Workflow Filters',
  //       color: 'primary',
  //       size: 'small',
  //       variant: 'contained'
  //     }
  //   }
  // ];

  // return (

  // return <AlertGrid items={alerts} />;...

  const onApplyFilter = filter => {
    const filtered = alerts.original.filter(a => a.file.name.startsWith(filter));
    setAlerts({ ...alerts, filtered });
  };

  return (
    // <AlertsGrid items={alerts.original} />
    <Box>
      <Box pb={theme.spacing(0.25)}>
        <AlertsHeader
          onFilterBtnClick={() => console.log('filter...')}
          onExpandBtnClick={() => setDrawer({ open: true, type: 'filter' })}
        />
      </Box>
      <AlertsSplitPanel loading={alerts.loading} items={alerts.original} />
      <Drawer open={drawer.open} anchor="right" onClose={() => setDrawer({ ...drawer, open: false })}>
        {
          {
            filter: (
              <Box minWidth={600} p={theme.spacing(0.5)}>
                <AlertsFilters onApplyBtnClick={() => setDrawer({ ...drawer, open: false })} />
              </Box>
            )
          }[drawer.type]
        }
      </Drawer>
    </Box>
  );
};

export default Alerts;
