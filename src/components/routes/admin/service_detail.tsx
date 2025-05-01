import CompareArrowsOutlinedIcon from '@mui/icons-material/CompareArrowsOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Button, CircularProgress, Paper, Skeleton, Tab, useTheme } from '@mui/material';
import PageCenter from 'commons/components/pages/PageCenter';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import type { ServiceConstants, Service as ServiceData } from 'components/models/base/service';
import ServiceContainer from 'components/routes/admin/service_detail/container';
import ServiceGeneral from 'components/routes/admin/service_detail/general';
import ServiceParams from 'components/routes/admin/service_detail/parameters';
import ServiceUpdater from 'components/routes/admin/service_detail/updater';
import { IconButton } from 'components/visual/Buttons/IconButton';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import CustomChip from 'components/visual/CustomChip';
import Empty from 'components/visual/Empty';
import { PageHeader } from 'components/visual/Layouts/PageHeader';
import type { JSONFeedItem } from 'components/visual/Notification/useNotificationFeed';
import { useNotificationFeed } from 'components/visual/Notification/useNotificationFeed';
import { RouterPrompt } from 'components/visual/RouterPrompt';
import { getVersionQuery } from 'helpers/utils';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useParams } from 'react-router';

const TAB_TYPES = ['general', 'docker', 'updater', 'params'] as const;
type TabType = (typeof TAB_TYPES)[number];

type ParamProps = {
  svc: string;
};

type ServiceProps = {
  name?: string | null;
  onDeleted?: () => void;
  onUpdated?: () => void;
};

function Service({ name = null, onDeleted = () => null, onUpdated = () => null }: ServiceProps) {
  const { t } = useTranslation(['adminServices']);
  const theme = useTheme();
  const navigate = useNavigate();
  const { svc } = useParams<ParamProps>();
  const { apiCall } = useMyAPI();
  const { user: currentUser, configuration } = useALContext();
  const { showSuccessMessage } = useMySnackbar();
  const { fetchJSONNotifications } = useNotificationFeed();

  const [service, setService] = useState<ServiceData>(null);
  const [serviceDefault, setServiceDefault] = useState<ServiceData>(null);
  const [serviceVersion, setServiceVersion] = useState<string>(null);
  const [serviceGeneralError, setServiceGeneralError] = useState<boolean>(false);
  const [overallError, setOverallError] = useState<boolean>(false);
  const [constants, setConstants] = useState<ServiceConstants>(null);
  const [versions, setVersions] = useState<string[]>(null);
  const [tab, setTab] = useState<TabType>('general');
  const [modified, setModified] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
  const [serviceFeeds, setServiceFeeds] = useState<JSONFeedItem[]>(null);

  const serviceNames = useMemo<string[]>(
    () =>
      (serviceFeeds || [])
        .reduce((prev: string[], item) => (item?.summary ? [...prev, item.summary] : prev), [])
        .sort(),
    [serviceFeeds]
  );

  function saveService() {
    apiCall({
      url: `/api/v4/service/${name || svc}/`,
      method: 'POST',
      body: service,
      onSuccess: () => {
        setModified(false);
        showSuccessMessage(t('save.success'));
        onUpdated();
      },
      onEnter: () => setButtonLoading(true),
      onExit: () => setButtonLoading(false)
    });
  }

  const onChangeTab = (event, newValue) => {
    setTab(newValue);
  };

  const closeDialog = () => {
    setDeleteDialog(false);
  };

  const handleExecuteDeleteButtonClick = () => {
    closeDialog();
    apiCall({
      url: `/api/v4/service/${name || svc}/`,
      method: 'DELETE',
      onSuccess: () => {
        showSuccessMessage(t('delete.success'));
        if (svc) setTimeout(() => navigate('/admin/services'), 1000);
        onDeleted();
      },
      onEnter: () => setButtonLoading(true),
      onExit: () => setButtonLoading(false)
    });
  };

  const handleDeleteButtonClick = () => {
    setDeleteDialog(true);
  };

  const handleToggleEnabled = () => {
    setModified(true);
    setService({ ...service, enabled: !service.enabled });
  };

  useEffect(() => {
    // Reset tab because we are using a different service
    setTab('general');
    setVersions(null);
    setModified(false);

    // Load user on start
    if (currentUser.is_admin) {
      apiCall<ServiceData>({
        url: `/api/v4/service/${name || svc}/`,
        onSuccess: api_data => {
          setService(api_data.api_response);
          setServiceVersion(api_data.api_response.version);
        }
      });
      apiCall<string[]>({
        url: `/api/v4/service/versions/${name || svc}/`,
        onSuccess: api_data => {
          setVersions(api_data.api_response);
        }
      });
    }
    // eslint-disable-next-line
  }, [name]);

  useEffect(() => {
    // Reset tab because we are using a different service
    setServiceDefault(null);

    // Load user on start
    if (currentUser.is_admin && serviceVersion) {
      apiCall<ServiceData>({
        url: `/api/v4/service/${name || svc}/${serviceVersion}/`,
        onSuccess: ({ api_response }) => setServiceDefault(api_response)
      });
    }
    // eslint-disable-next-line
  }, [serviceVersion]);

  useEffect(() => {
    // Set the global error flag based on each sub-error value
    setOverallError(serviceGeneralError);
  }, [serviceGeneralError]);

  useEffect(() => {
    // Load constants on page load
    if (!currentUser.is_admin) return;
    apiCall<ServiceConstants>({
      url: '/api/v4/service/constants/',
      onSuccess: ({ api_response }) => setConstants(api_response)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchJSONNotifications({
      urls: configuration?.ui?.services_feed ? [configuration?.ui?.services_feed] : [],
      onSuccess: values => setServiceFeeds(values)
    });
  }, [configuration?.ui?.services_feed, fetchJSONNotifications, setServiceFeeds]);

  return !currentUser.is_admin ? (
    <Navigate to="/forbidden" replace />
  ) : (
    <PageCenter margin={!svc ? 2 : 4} width="100%" textAlign="left">
      <ConfirmationDialog
        open={deleteDialog}
        handleClose={() => setDeleteDialog(false)}
        handleAccept={handleExecuteDeleteButtonClick}
        title={t('delete.title')}
        cancelText={t('delete.cancelText')}
        acceptText={t('delete.acceptText')}
        text={t('delete.text')}
        waiting={buttonLoading}
      />

      <PageHeader
        primary={service ? service.name : <Skeleton style={{ width: '20rem' }} />}
        secondary={t('title.detail')}
        loading={!service}
        slotProps={{
          root: { style: { marginBottom: theme.spacing(2) } }
        }}
        actions={
          <>
            <IconButton
              loading={!service}
              size="large"
              sx={{ color: theme.palette.action.active }}
              tooltip={t('errors')}
              to={() =>
                `/admin/errors?filters=response.service_name%3A${service.name}&filters=${getVersionQuery(
                  service.version
                )}`
              }
            >
              <ErrorOutlineOutlinedIcon />
            </IconButton>

            <IconButton
              loading={!service}
              size="large"
              sx={{ color: theme.palette.action.active }}
              to={() => `/admin/service_review?service=${service.name}&v1=${service.version}`}
              tooltip={t('compare')}
            >
              <CompareArrowsOutlinedIcon />
            </IconButton>

            <IconButton
              loading={!service}
              size="large"
              tooltip={t('remove')}
              onClick={handleDeleteButtonClick}
              sx={{
                color: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark
              }}
            >
              <RemoveCircleOutlineOutlinedIcon />
            </IconButton>
          </>
        }
      />

      {service ? (
        <CustomChip
          type="rounded"
          color={service.enabled ? 'primary' : 'default'}
          onClick={handleToggleEnabled}
          label={service.enabled ? t('enabled') : t('disabled')}
          fullWidth
          style={{ marginBottom: theme.spacing(2) }}
        />
      ) : (
        <Skeleton variant="rectangular" height="2.5rem" style={{ marginBottom: theme.spacing(1) }} />
      )}

      {service ? (
        <TabContext value={tab}>
          <Paper
            square
            style={{ backgroundColor: name ? theme.palette.background.default : theme.palette.background.paper }}
          >
            <TabList onChange={onChangeTab} indicatorColor="primary" textColor="primary">
              <Tab label={t('tab.general')} value="general" />
              <Tab label={t('tab.docker')} value="docker" />
              {service.update_config ? <Tab label={t('tab.updater')} value="updater" /> : <Empty />}
              <Tab label={t('tab.params')} value="params" />
            </TabList>
          </Paper>
          <TabPanel value="general" style={{ paddingLeft: 0, paddingRight: 0 }}>
            <ServiceGeneral
              constants={constants}
              defaults={serviceDefault}
              service={service}
              serviceNames={serviceNames}
              versions={versions}
              setError={setServiceGeneralError}
              setModified={setModified}
              setService={setService}
            />
          </TabPanel>
          <TabPanel value="docker" style={{ paddingLeft: 0, paddingRight: 0 }}>
            <ServiceContainer
              service={service}
              defaults={serviceDefault}
              setService={setService}
              setModified={setModified}
            />
          </TabPanel>
          {service.update_config && (
            <TabPanel value="updater" style={{ paddingLeft: 0, paddingRight: 0 }}>
              <ServiceUpdater
                service={service}
                defaults={serviceDefault}
                setService={setService}
                setModified={setModified}
              />
            </TabPanel>
          )}
          <TabPanel value="params" style={{ paddingLeft: 0, paddingRight: 0 }}>
            <ServiceParams service={service} setService={setService} setModified={setModified} />
          </TabPanel>
        </TabContext>
      ) : (
        <Skeleton variant="rectangular" height="10rem" />
      )}

      <RouterPrompt when={modified} />

      {service && modified ? (
        <div
          style={{
            paddingTop: theme.spacing(1),
            paddingBottom: theme.spacing(1),
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            textAlign: 'center',
            zIndex: theme.zIndex.drawer - 1,
            backgroundColor: theme.palette.background.default,
            boxShadow: theme.shadows[4]
          }}
        >
          <Button
            variant="contained"
            color="primary"
            disabled={overallError || buttonLoading || !modified}
            onClick={saveService}
          >
            {t('save')}
            {buttonLoading && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
          </Button>
        </div>
      ) : null}
    </PageCenter>
  );
}

export default Service;
