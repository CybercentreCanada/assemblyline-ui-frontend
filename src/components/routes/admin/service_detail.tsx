import CompareArrowsOutlinedIcon from '@mui/icons-material/CompareArrowsOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import {
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  Skeleton,
  Tab,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageCenter from 'commons/components/pages/PageCenter';
import { useEffectOnce } from 'commons/components/utils/hooks/useEffectOnce';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { CustomUser } from 'components/hooks/useMyUser';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import CustomChip from 'components/visual/CustomChip';
import Empty from 'components/visual/Empty';
import { RouterPrompt } from 'components/visual/RouterPrompt';
import { getVersionQuery } from 'helpers/utils';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router';
import { Link, useParams } from 'react-router-dom';
import ServiceContainer from './service_detail/container';
import ServiceGeneral from './service_detail/general';
import ServiceParams from './service_detail/parameters';
import ServiceUpdater from './service_detail/updater';

type ServiceProps = {
  name?: string | null;
  onDeleted?: () => void;
  onUpdated?: () => void;
};

type ParamProps = {
  svc: string;
};

export type Volume = {
  capacity: string;
  mount_path: string;
  storage_class: string;
  access_mode: 'ReadWriteOnce' | 'ReadWriteMany';
};

export type Environment = {
  name: string;
  value: string;
};

export type Container = {
  allow_internet_access: boolean;
  command: string[];
  cpu_cores: number;
  environment: Environment[];
  image: string;
  ports: string[];
  ram_mb: number;
  ram_mb_min: number;
  registry_password: string;
  registry_username: string;
  registry_type: 'docker' | 'harbor';
  service_account?: string;
};

export type SubmissionParams = {
  default: string | boolean | number;
  name: string;
  type: 'int' | 'bool' | 'str' | 'list';
  value: string | boolean | number;
  list?: string[];
  hide?: boolean;
};

export type SourceStatus = {
  last_successful_update: string;
  state: string;
  message: string;
  ts: string;
};

export type Source = {
  ca_cert: string;
  default_classification: string;
  headers: Environment[];
  name: string;
  password: string;
  pattern: string;
  private_key: string;
  proxy: string;
  ssl_ignore_errors: boolean;
  uri: string;
  username: string;
  git_branch: string;
  status: SourceStatus;
};

type UpdateConfig = {
  generates_signatures: boolean;
  method: 'run' | 'build';
  run_options: Container;
  sources: Source[];
  update_interval_seconds: number;
  wait_for_update: boolean;
  signature_delimiter: 'new_line' | 'double_new_line' | 'pipe' | 'comma' | 'space' | 'none' | 'file' | 'custom';
  custom_delimiter: string;
};

export type ServiceDetail = {
  accepts: string;
  category: string;
  config: {
    [name: string]: string;
  };
  default_result_classification: string;
  dependencies: {
    [name: string]: {
      container: Container;
      volumes: {
        [name: string]: Volume;
      };
    };
  };
  description: string;
  disable_cache: boolean;
  docker_config: Container;
  enabled: boolean;
  is_external: boolean;
  licence_count: number;
  max_queue_length: number;
  name: string;
  privileged: boolean;
  rejects: string;
  stage: string;
  submission_params: SubmissionParams[];
  timeout: number;
  update_channel: 'dev' | 'beta' | 'rc' | 'stable';
  update_config: UpdateConfig;
  version: string;
};

export type ServiceConstants = {
  categories: string[];
  stages: string[];
};

const useStyles = makeStyles(() => ({
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  }
}));

function Service({ name, onDeleted, onUpdated }: ServiceProps) {
  const { svc } = useParams<ParamProps>();
  const { t } = useTranslation(['adminServices']);
  const [service, setService] = useState<ServiceDetail>(null);
  const [serviceDefault, setServiceDefault] = useState<ServiceDetail>(null);
  const [serviceVersion, setServiceVersion] = useState<string>(null);
  const [constants, setConstants] = useState<ServiceConstants>(null);
  const [versions, setVersions] = useState<string[]>(null);
  const [tab, setTab] = useState('general');
  const [modified, setModified] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const theme = useTheme();
  const [deleteDialog, setDeleteDialog] = useState(false);
  const { user: currentUser } = useAppUser<CustomUser>();
  const { showSuccessMessage } = useMySnackbar();
  const navigate = useNavigate();
  const classes = useStyles();

  const { apiCall } = useMyAPI();

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
    setServiceDefault(null);

    // Load user on start
    if (currentUser.is_admin) {
      apiCall({
        url: `/api/v4/service/${name || svc}/`,
        onSuccess: api_data => {
          setService(api_data.api_response);
          setServiceVersion(api_data.api_response.version);
        }
      });
      apiCall({
        url: `/api/v4/service/versions/${name || svc}/`,
        onSuccess: api_data => {
          setVersions(api_data.api_response);
        }
      });
    }
    // eslint-disable-next-line
  }, [name]);

  useEffect(() => {
    // Load user on start
    if (currentUser.is_admin && serviceVersion) {
      apiCall({
        url: `/api/v4/service/${name || svc}/${serviceVersion}/`,
        onSuccess: api_data => {
          setServiceDefault(api_data.api_response);
        }
      });
    }
    // eslint-disable-next-line
  }, [serviceVersion]);

  useEffectOnce(() => {
    // Load constants on page load
    if (currentUser.is_admin) {
      apiCall({
        url: '/api/v4/service/constants/',
        onSuccess: api_data => {
          setConstants(api_data.api_response);
        }
      });
    }
  });

  return !currentUser.is_admin ? (
    <Navigate to="/forbidden" />
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
      <Grid container alignItems="center" spacing={3} style={{ paddingBottom: theme.spacing(2) }}>
        <Grid item xs>
          <Typography variant="h4">{service ? service.name : <Skeleton style={{ width: '20rem' }} />}</Typography>
          <Typography variant="caption">{t('title.detail')}</Typography>
        </Grid>
        <Grid item xs style={{ textAlign: 'right', flexGrow: 0 }}>
          {service ? (
            <div style={{ display: 'flex', marginBottom: theme.spacing(1), justifyContent: 'flex-end' }}>
              <Tooltip title={t('errors')}>
                <IconButton
                  component={Link}
                  style={{ color: theme.palette.action.active }}
                  to={`/admin/errors?filters=response.service_name%3A${service.name}&filters=${getVersionQuery(
                    service.version
                  )}`}
                  size="large"
                >
                  <ErrorOutlineOutlinedIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('compare')}>
                <IconButton
                  component={Link}
                  style={{ color: theme.palette.action.active }}
                  to={`/admin/service_review?service=${service.name}&v1=${service.version}`}
                  size="large"
                >
                  <CompareArrowsOutlinedIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('remove')}>
                <IconButton
                  style={{
                    color: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark
                  }}
                  onClick={handleDeleteButtonClick}
                  size="large"
                >
                  <RemoveCircleOutlineOutlinedIcon />
                </IconButton>
              </Tooltip>
            </div>
          ) : (
            <div style={{ display: 'flex', marginBottom: theme.spacing(1), justifyContent: 'flex-end' }}>
              <Skeleton variant="circular" height="2.5rem" width="2.5rem" style={{ margin: theme.spacing(0.5) }} />
              <Skeleton variant="circular" height="2.5rem" width="2.5rem" style={{ margin: theme.spacing(0.5) }} />
              <Skeleton variant="circular" height="2.5rem" width="2.5rem" style={{ margin: theme.spacing(0.5) }} />
            </div>
          )}
        </Grid>
      </Grid>

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
              service={service}
              defaults={serviceDefault}
              setService={setService}
              setModified={setModified}
              constants={constants}
              versions={versions}
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
          <Button variant="contained" color="primary" disabled={buttonLoading || !modified} onClick={saveService}>
            {t('save')}
            {buttonLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
          </Button>
        </div>
      ) : null}
    </PageCenter>
  );
}

Service.defaultProps = {
  name: null,
  onDeleted: () => null,
  onUpdated: () => null
};

export default Service;
