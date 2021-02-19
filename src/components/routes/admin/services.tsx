import { Typography, useTheme } from '@material-ui/core';
import useUser from 'commons/components/hooks/useAppUser';
import PageFullWidth from 'commons/components/layout/pages/PageFullWidth';
import useDrawer from 'components/hooks/useDrawer';
import useMyAPI from 'components/hooks/useMyAPI';
import { CustomUser } from 'components/hooks/useMyUser';
import Service from 'components/routes/admin/service_detail';
import ServiceTable from 'components/visual/SearchResult/service';
import 'moment/locale/fr';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom';

export default function Services() {
  const { t } = useTranslation(['adminServices']);
  const [serviceResults, setServiceResults] = useState(null);
  const [updates, setUpdates] = useState(null);
  const theme = useTheme();
  const apiCall = useMyAPI();
  const { user: currentUser } = useUser<CustomUser>();
  const { setGlobalDrawer } = useDrawer();

  const reload = () => {
    apiCall({
      url: '/api/v4/service/all/',
      onSuccess: api_data => {
        setServiceResults(api_data.api_response);
      }
    });
    apiCall({
      url: '/api/v4/service/updates/',
      onSuccess: api_data => {
        setUpdates(api_data.api_response);
      }
    });
  };

  useEffect(() => {
    if (currentUser.is_admin) {
      reload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onUpdate = useCallback(
    (svc, updateData) => {
      apiCall({
        method: 'PUT',
        url: '/api/v4/service/update/',
        body: {
          name: svc,
          update_data: updateData
        },
        onSuccess: () => {
          const newUpdates = { ...updates };
          newUpdates[svc] = { ...newUpdates[svc], updating: true };
          setUpdates(newUpdates);
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updates]
  );

  const onDeleted = () => {
    setGlobalDrawer(null);
    setTimeout(() => reload(), 1000);
  };

  const setService = useCallback(
    service_name => {
      setGlobalDrawer(<Service name={service_name} onDeleted={onDeleted} />);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return currentUser.is_admin ? (
    <PageFullWidth margin={4}>
      <div style={{ paddingBottom: theme.spacing(2) }}>
        <Typography variant="h4">{t('title')}</Typography>
      </div>

      <div style={{ paddingTop: theme.spacing(2), paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
        <ServiceTable serviceResults={serviceResults} updates={updates} setService={setService} onUpdate={onUpdate} />
      </div>
    </PageFullWidth>
  ) : (
    <Redirect to="/forbidden" />
  );
}
