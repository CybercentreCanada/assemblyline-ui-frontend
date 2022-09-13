import { Skeleton } from '@material-ui/lab';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ForbiddenPage from './403';
import AlertDetails from './alerts/alert-details';
import { AlertItem } from './alerts/hooks/useAlerts';

type ParamProps = {
  id: string;
};

function AlertFullDetails() {
  const { id } = useParams<ParamProps>();
  const [alert, setAlert] = useState<AlertItem | null>(null);
  const { apiCall } = useMyAPI();
  const { user: currentUser } = useALContext();

  useEffect(() => {
    if (currentUser.roles.includes('alert_view')) {
      apiCall({
        url: `/api/v4/alert/${id}/`,
        onSuccess: api_data => {
          setAlert(api_data.api_response);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  //
  return currentUser.roles.includes('alert_view') ? (
    <PageCenter margin={4} width="100%" textAlign="left">
      {alert ? <AlertDetails id="" /> : <Skeleton variant="rect" height={8} />}
    </PageCenter>
  ) : (
    <ForbiddenPage />
  );
}

export default AlertFullDetails;
