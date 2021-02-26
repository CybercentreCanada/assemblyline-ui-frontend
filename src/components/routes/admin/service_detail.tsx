import {
  Button,
  CircularProgress,
  Grid,
  IconButton,
  makeStyles,
  Paper,
  Tab,
  Tooltip,
  Typography,
  useTheme
} from '@material-ui/core';
import RemoveCircleOutlineOutlinedIcon from '@material-ui/icons/RemoveCircleOutlineOutlined';
import { Skeleton, TabContext, TabList, TabPanel } from '@material-ui/lab';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import Empty from 'components/visual/Empty';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, useHistory, useParams } from 'react-router-dom';
import UnderConstruction from '../under_construction';
import ServiceContainer from './service_detail/container';
import ServiceGeneral from './service_detail/general';
import ServiceParams from './service_detail/parameters';

type ServiceProps = {
  name?: string | null;
  onDeleted?: () => void;
};

type ParamProps = {
  svc: string;
};

export type Volume = {
  capacity: string;
  mount_path: string;
  storage_class: string;
};

type Environment = {
  name: string;
  value: string;
};

export type Container = {
  allow_internet_access: boolean;
  command: string;
  cpu_cores: number;
  environment: Environment[];
  image: string;
  ports: string[];
  ram_mb: number;
  ram_mb_min: number;
  registry_password: string;
  registry_username: string;
};

export type SubmissionParams = {
  default: string | boolean | number;
  name: string;
  type: 'int' | 'bool' | 'str' | 'list';
  value: string | boolean | number;
  list?: string[];
};

type Source = {
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
};

type UpdateConfig = {
  generate_signatures: boolean;
  method: 'run' | 'build';
  run_options: Container;
  sources: Source[];
  update_interval_seconds: number;
  wait_for_update: boolean;
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
  name: string;
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

function Service({ name, onDeleted }: ServiceProps) {
  const { svc } = useParams<ParamProps>();
  const { t } = useTranslation(['adminServices']);
  const [service, setService] = useState<ServiceDetail>(null);
  const [constants, setConstants] = useState<ServiceConstants>(null);
  const [versions, setVersions] = useState<string[]>(null);
  const [tab, setTab] = useState('general');
  const [modified, setModified] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const theme = useTheme();
  const [deleteDialog, setDeleteDialog] = useState(false);
  const { user: currentUser } = useALContext();
  const { showSuccessMessage } = useMySnackbar();
  const history = useHistory();
  const classes = useStyles();

  const apiCall = useMyAPI();

  function saveService() {
    apiCall({
      url: `/api/v4/service/${name || svc}/`,
      method: 'POST',
      body: service,
      onSuccess: () => {
        setModified(false);
        showSuccessMessage(t('save.success'));
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
        if (svc) setTimeout(() => history.push('/admin/services'), 1000);
        onDeleted();
      }
    });
  };

  const handleDeleteButtonClick = () => {
    setDeleteDialog(true);
  };

  useEffect(() => {
    // Load user on start
    if (currentUser.is_admin) {
      apiCall({
        url: `/api/v4/service/${name || svc}/`,
        onSuccess: api_data => {
          setService(api_data.api_response);
        }
      });
      apiCall({
        url: '/api/v4/service/constants/',
        onSuccess: api_data => {
          setConstants(api_data.api_response);
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
  }, []);

  return !currentUser.is_admin ? (
    <Redirect to="/forbidden" />
  ) : (
    <PageCenter margin={!svc ? 2 : 4} width="100%">
      <div style={{ textAlign: 'left' }}>
        <ConfirmationDialog
          open={deleteDialog}
          handleClose={() => setDeleteDialog(false)}
          handleAccept={handleExecuteDeleteButtonClick}
          title={t('delete.title')}
          cancelText={t('delete.cancelText')}
          acceptText={t('delete.acceptText')}
          text={t('delete.text')}
        />
        <Grid container alignItems="center" spacing={3} style={{ paddingBottom: theme.spacing(2) }}>
          <Grid item xs>
            <Typography variant="h4">{service ? service.name : <Skeleton style={{ width: '20rem' }} />}</Typography>
            <Typography variant="caption">{t('title.detail')}</Typography>
          </Grid>
          <Grid item xs style={{ textAlign: 'right', flexGrow: 0 }}>
            {service ? (
              <>
                <div style={{ display: 'flex', marginBottom: theme.spacing(1), justifyContent: 'flex-end' }}>
                  <Tooltip title={t('remove')}>
                    <IconButton
                      style={{
                        color: theme.palette.type === 'dark' ? theme.palette.error.light : theme.palette.error.dark
                      }}
                      onClick={handleDeleteButtonClick}
                    >
                      <RemoveCircleOutlineOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                </div>
              </>
            ) : (
              <Skeleton variant="circle" height="2.5rem" width="2.5rem" style={{ margin: theme.spacing(0.5) }} />
            )}
          </Grid>
        </Grid>

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
                setService={setService}
                setModified={setModified}
                constants={constants}
                versions={versions}
              />
            </TabPanel>
            <TabPanel value="docker" style={{ paddingLeft: 0, paddingRight: 0 }}>
              <ServiceContainer service={service} setService={setService} setModified={setModified} />
            </TabPanel>
            <TabPanel value="updater" style={{ paddingLeft: 0, paddingRight: 0 }}>
              <UnderConstruction page="Updater Tab" />
            </TabPanel>
            <TabPanel value="params" style={{ paddingLeft: 0, paddingRight: 0 }}>
              <ServiceParams service={service} setService={setService} setModified={setModified} />
            </TabPanel>
          </TabContext>
        ) : (
          <Skeleton variant="rect" height="10rem" />
        )}
      </div>

      {service && modified ? (
        <div
          style={{
            paddingTop: theme.spacing(1),
            paddingBottom: theme.spacing(1),
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
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
  onDeleted: () => null
};

export default Service;
