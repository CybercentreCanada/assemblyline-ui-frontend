import { Box } from '@material-ui/core';
import PageHeader from 'commons/components/layout/pages/PageHeader';
import useMyAPI from 'components/hooks/useMyAPI';
import React, { useEffect, useState } from 'react';
import { AlertItem } from './alert';
import AlertList from './alert-list';

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
  }, []);

  return (
    <Box>
      <PageHeader mode="provided" title={<h2>{`Total: ${alerts.length}`}</h2>} />
      <AlertList items={alerts} />
    </Box>
  );
};

export default Alerts;
