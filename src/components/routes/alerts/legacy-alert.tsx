import PageCenter from 'commons/components/layout/pages/PageCenter';
import useMyAPI from 'components/hooks/useMyAPI';
import { useEffect, useState } from 'react';
import AlertCardItem from './alert-card';

export default function AlertsLegacy() {
  const { apiCall } = useMyAPI();
  const [alerts, setAlerts] = useState(null);

  useEffect(() => {
    apiCall({
      method: 'GET',
      url: '/api/v4/alert/grouped/file.sha256/?offset=0&rows=25&q=&tc=4d',
      onSuccess: api_data => {
        setAlerts(api_data.api_response.items);
      }
    });
    // eslint-disable-next-line
  }, []);

  return (
    <PageCenter margin={4} width="100%">
      <h1>Alert Legacy Test</h1>
      <div style={{ textAlign: 'left' }}>
        {alerts &&
          alerts.map((a, i) => (
            <div key={i}>
              <AlertCardItem item={a} />
            </div>
          ))}
      </div>
    </PageCenter>
  );
}
