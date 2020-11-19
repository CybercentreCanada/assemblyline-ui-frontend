import { Card, Grid, makeStyles, Tooltip, Typography, useTheme } from '@material-ui/core';
import ErrorOutlineOutlinedIcon from '@material-ui/icons/ErrorOutlineOutlined';
import SpeedOutlinedIcon from '@material-ui/icons/SpeedOutlined';
import PageFullscreen from 'commons/components/layout/pages/PageFullScreen';
import CustomChip from 'components/visual/CustomChip';
import React, { useEffect, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import io from 'socket.io-client';

const NAMESPACE = '/status';

const useStyles = makeStyles(theme => ({
  card: {
    flexGrow: 1,
    padding: theme.spacing(1),
    minHeight: '116px',
    '&:hover': {
      boxShadow: theme.shadows[6]
    }
  },
  core_card: {
    flexGrow: 1,
    padding: theme.spacing(1),
    minHeight: '150px',
    '&:hover': {
      boxShadow: theme.shadows[6]
    }
  },
  icon: {
    marginRight: '4px',
    verticalAlign: 'middle',
    height: '20px',
    color: theme.palette.action.active
  },
  metric: {
    marginRight: theme.spacing(1)
  },
  muted: {
    color: theme.palette.text.secondary
  },
  title: {
    fontWeight: 500,
    fontSize: '120%'
  }
}));

const WrappedIngestCard = ({ ingester }) => {
  const { t } = useTranslation(['dashboard']);
  const classes = useStyles();

  return (
    <Card className={classes.core_card}>
      <div style={{ float: 'right' }}>
        <ErrorOutlineOutlinedIcon />
      </div>
      <div className={classes.title}>{`${t('ingester')} :: x${ingester.instances}`}</div>

      <Grid container>
        <Grid item xs={12} sm={3}>
          <div>
            <label>{t('ingest')}</label>
          </div>
          <div>
            <Tooltip title={t('ingest.queue')}>
              <span className={classes.metric}>
                <CustomChip size="tiny" type="rounded" mono label={t('Q')} />
                {ingester.queues.ingest}
              </span>
            </Tooltip>
          </div>
        </Grid>
        <Grid item xs={12} sm={6}>
          <div>
            <label>{t('queued')}</label>
          </div>
          <div>
            <Tooltip title={t('queue.critical')}>
              <span className={classes.metric}>
                <CustomChip size="tiny" type="rounded" mono label={t('C')} />
                {ingester.queues.critical}
              </span>
            </Tooltip>
            <Tooltip title={t('queue.high')}>
              <span className={classes.metric}>
                <CustomChip size="tiny" type="rounded" mono label={t('H')} />
                {ingester.queues.high}
              </span>
            </Tooltip>
            <Tooltip title={t('queue.medium')}>
              <span className={classes.metric}>
                <CustomChip size="tiny" type="rounded" mono label={t('M')} />
                {ingester.queues.medium}
              </span>
            </Tooltip>
            <Tooltip title={t('queue.low')}>
              <span className={classes.metric}>
                <CustomChip size="tiny" type="rounded" mono label={t('L')} />
                {ingester.queues.low}
              </span>
            </Tooltip>
          </div>
        </Grid>
        <Grid item xs={12} sm={3}>
          <div>
            <label>{t('processing')}</label>
          </div>
          <div>
            <Tooltip title={t('processing.inflight')}>
              <span className={classes.metric}>
                <CustomChip size="tiny" type="rounded" mono label={t('I')} />
                {ingester.processing.inflight}
              </span>
            </Tooltip>
          </div>
        </Grid>
        <Grid item xs={12} sm={3}>
          <div>
            <label>{t('caching')}</label>
          </div>
          <div>
            <Tooltip title={t('caching.hits')}>
              <span className={classes.metric}>
                <CustomChip size="tiny" type="rounded" mono label={t('H')} />
                {ingester.metrics.cache_hit}
              </span>
            </Tooltip>
            <Tooltip title={t('caching.miss')}>
              <span className={classes.metric}>
                <CustomChip size="tiny" type="rounded" mono label={t('M')} />
                {ingester.metrics.cache_miss}
              </span>
            </Tooltip>
          </div>
        </Grid>
        <Grid item xs={12} sm={9}>
          <div>
            <label>{t('throuput')}</label>
          </div>
          <div>
            <Tooltip title={t('throuput.files_completed')}>
              <span className={classes.metric}>
                <CustomChip size="tiny" type="rounded" mono label={t('F')} />
                {ingester.metrics.files_completed}
              </span>
            </Tooltip>
            <Tooltip title={t('throuput.submissions_completed')}>
              <span className={classes.metric}>
                <CustomChip size="tiny" type="rounded" mono label={t('C')} />
                {ingester.metrics.submissions_completed}
              </span>
            </Tooltip>
            <Tooltip title={t('throuput.whitelisted')}>
              <span className={classes.metric}>
                <CustomChip size="tiny" type="rounded" mono label={t('W')} />
                {ingester.metrics.whitelisted}
              </span>
            </Tooltip>
            <Tooltip title={t('throuput.skipped')}>
              <span className={classes.metric}>
                <CustomChip size="tiny" type="rounded" mono label={t('S')} />
                {ingester.metrics.skipped}
              </span>
            </Tooltip>
            <Tooltip title={t('throuput.duplicates')}>
              <span className={classes.metric}>
                <CustomChip size="tiny" type="rounded" mono label={t('D')} />
                {ingester.metrics.duplicates}
              </span>
            </Tooltip>
            <Tooltip title={t('throuput.error')}>
              <span className={classes.metric}>
                <CustomChip size="tiny" type="rounded" mono label={t('E')} />
                {ingester.metrics.error}
              </span>
            </Tooltip>
            <Tooltip title={t('throuput.bytes')}>
              <span style={{ marginLeft: '8px' }}>
                <SpeedOutlinedIcon className={classes.icon} />
                {`${ingester.metrics.bytes_completed} / ${ingester.metrics.bytes_ingested} Mbps`}
              </span>
            </Tooltip>
          </div>
        </Grid>
      </Grid>
    </Card>
  );
};

const WrappedDispatcherCard = ({ dispatcher, up, down }) => {
  const { t } = useTranslation(['dashboard']);
  const classes = useStyles();

  return (
    <Card className={classes.core_card}>
      <div style={{ float: 'right' }}>
        <ErrorOutlineOutlinedIcon />
      </div>
      <div className={classes.title}>{`${t('dispatcher')} :: x${dispatcher.instances}`}</div>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <div>
            <label>{t('services')}</label>
          </div>
          <div>
            {up.length === 0 && down.length === 0 && <span className={classes.muted}>{t('no_services')}</span>}
            {up.length !== 0 && <span>{up.join(' | ')}</span>}
            {up.length !== 0 && down.length !== 0 && <span> :: </span>}
            {down.length !== 0 && <span>{down.join(' | ')}</span>}
          </div>
        </Grid>
        <Grid item xs={12} sm={3}>
          <div>
            <label>{t('submissions')}</label>
          </div>
          <div>
            <Tooltip title={t('submissions.outstanding')}>
              <span className={classes.metric}>
                <CustomChip size="tiny" type="rounded" mono label={t('O')} />
                {dispatcher.inflight.outstanding} / {dispatcher.inflight.max}
              </span>
            </Tooltip>
          </div>
        </Grid>
        <Grid item xs={12} sm={3}>
          <div>
            <label>{t('queues')}</label>
          </div>
          <div>
            <Tooltip title={t('queues.ingest')}>
              <span className={classes.metric}>
                <CustomChip size="tiny" type="rounded" mono label={t('I')} />
                {dispatcher.queues.ingest}
              </span>
            </Tooltip>
          </div>
        </Grid>
        <Grid item xs={12} sm={6}>
          <div>
            <label>{t('throughput')}</label>
          </div>
          <div>
            <Tooltip title={t('throughput.files_completed')}>
              <span className={classes.metric}>
                <CustomChip size="tiny" type="rounded" mono label={t('F')} />
                {dispatcher.metrics.files_completed}
              </span>
            </Tooltip>
            <Tooltip title={t('throughput.submissions_completed')}>
              <span className={classes.metric}>
                <CustomChip size="tiny" type="rounded" mono label={t('S')} />
                {dispatcher.metrics.submissions_completed}
              </span>
            </Tooltip>
          </div>
        </Grid>
      </Grid>
    </Card>
  );
};

const WrappedExpiryCard = ({ expiry }) => {
  const { t } = useTranslation(['dashboard']);
  const classes = useStyles();

  return (
    <Card className={classes.core_card}>
      <div style={{ float: 'right' }}>
        <ErrorOutlineOutlinedIcon />
      </div>
      <div className={classes.title}>{`${t('expiry')} :: x${expiry.instances}`}</div>
      <Grid container spacing={1}>
        <Grid item xs={12} sm={6}>
          <div>
            <label>{t('queues')}</label>
          </div>
          <div>
            <Tooltip title={t('queues.alert')}>
              <span className={classes.metric}>
                <CustomChip size="tiny" type="rounded" mono label={t('A')} />
                {expiry.queues.alert}
              </span>
            </Tooltip>
            <Tooltip title={t('queues.error')}>
              <span className={classes.metric}>
                <CustomChip size="tiny" type="rounded" mono label={t('E')} />
                {expiry.queues.error}
              </span>
            </Tooltip>
            <Tooltip title={t('queues.file')}>
              <span className={classes.metric}>
                <CustomChip size="tiny" type="rounded" mono label={t('F')} />
                {expiry.queues.cached_file + expiry.queues.file + expiry.queues.filescore}
              </span>
            </Tooltip>
            <Tooltip title={t('queues.result')}>
              <span className={classes.metric}>
                <CustomChip size="tiny" type="rounded" mono label={t('R')} />
                {expiry.queues.result + expiry.queues.emptyresult}
              </span>
            </Tooltip>
            <Tooltip title={t('queues.submission')}>
              <span className={classes.metric}>
                <CustomChip size="tiny" type="rounded" mono label={t('S')} />
                {expiry.queues.submission + expiry.queues.submission_summary + expiry.queues.submission_tree}
              </span>
            </Tooltip>
          </div>
        </Grid>
        <Grid item xs={12} sm={6}>
          <div>
            <label>{t('expired')}</label>
          </div>
          <div>
            <Tooltip title={t('expired.alert')}>
              <span className={classes.metric}>
                <CustomChip size="tiny" type="rounded" mono label={t('A')} />
                {expiry.metrics.alert}
              </span>
            </Tooltip>
            <Tooltip title={t('expired.error')}>
              <span className={classes.metric}>
                <CustomChip size="tiny" type="rounded" mono label={t('E')} />
                {expiry.metrics.error}
              </span>
            </Tooltip>
            <Tooltip title={t('expired.file')}>
              <span className={classes.metric}>
                <CustomChip size="tiny" type="rounded" mono label={t('F')} />
                {expiry.metrics.cached_file + expiry.metrics.file + expiry.metrics.filescore}
              </span>
            </Tooltip>
            <Tooltip title={t('expired.result')}>
              <span className={classes.metric}>
                <CustomChip size="tiny" type="rounded" mono label={t('R')} />
                {expiry.metrics.result + expiry.metrics.emptyresult}
              </span>
            </Tooltip>
            <Tooltip title={t('expired.submission')}>
              <span className={classes.metric}>
                <CustomChip size="tiny" type="rounded" mono label={t('S')} />
                {expiry.metrics.submission + expiry.metrics.submission_summary + expiry.metrics.submission_tree}
              </span>
            </Tooltip>
          </div>
        </Grid>
        <Grid item xs={12} sm={6} />
        <Grid item xs={12} sm={6}>
          <div>
            <label>{t('archived')}</label>
          </div>
          <div>
            <Tooltip title={t('archived.alert')}>
              <span className={classes.metric}>
                <CustomChip size="tiny" type="rounded" mono label={t('A')} />
                {expiry.archive.alert}
              </span>
            </Tooltip>
            <Tooltip title={t('archived.error')}>
              <span className={classes.metric}>
                <CustomChip size="tiny" type="rounded" mono label={t('E')} />
                {expiry.archive.error}
              </span>
            </Tooltip>
            <Tooltip title={t('archived.file')}>
              <span className={classes.metric}>
                <CustomChip size="tiny" type="rounded" mono label={t('F')} />
                {expiry.archive.cached_file + expiry.archive.file + expiry.archive.filescore}
              </span>
            </Tooltip>
            <Tooltip title={t('archived.result')}>
              <span className={classes.metric}>
                <CustomChip size="tiny" type="rounded" mono label={t('R')} />
                {expiry.archive.result + expiry.archive.emptyresult}
              </span>
            </Tooltip>
            <Tooltip title={t('archived.submission')}>
              <span className={classes.metric}>
                <CustomChip size="tiny" type="rounded" mono label={t('S')} />
                {expiry.archive.submission + expiry.archive.submission_summary + expiry.archive.submission_tree}
              </span>
            </Tooltip>
          </div>
        </Grid>
      </Grid>
    </Card>
  );
};

const WrappedAlerterCard = ({ alerter }) => {
  const { t } = useTranslation(['dashboard']);
  const classes = useStyles();

  return (
    <Card className={classes.core_card}>
      <div style={{ float: 'right' }}>
        <ErrorOutlineOutlinedIcon />
      </div>
      <div className={classes.title}>{`${t('alerter')} :: x${alerter.instances}`}</div>
      <Grid container spacing={1}>
        <Grid item xs={12} sm={4}>
          <div>
            <label>{t('queues')}</label>
          </div>
          <div>
            <Tooltip title={t('queues.alert')}>
              <span className={classes.metric}>
                <CustomChip size="tiny" type="rounded" mono label={t('A')} />
                {alerter.queues.alert}
              </span>
            </Tooltip>
          </div>
        </Grid>
        <Grid item xs={12} sm={8}>
          <div>
            <label>{t('throuput')}</label>
          </div>
          <div>
            <Tooltip title={t('throuput.created')}>
              <span className={classes.metric}>
                <CustomChip size="tiny" type="rounded" mono label={t('C')} />
                {alerter.metrics.created}
              </span>
            </Tooltip>
            <Tooltip title={t('throuput.error')}>
              <span className={classes.metric}>
                <CustomChip size="tiny" type="rounded" mono label={t('E')} />
                {alerter.metrics.error}
              </span>
            </Tooltip>
            <Tooltip title={t('throuput.received')}>
              <span className={classes.metric}>
                <CustomChip size="tiny" type="rounded" mono label={t('R')} />
                {alerter.metrics.received}
              </span>
            </Tooltip>
            <Tooltip title={t('throuput.updated')}>
              <span className={classes.metric}>
                <CustomChip size="tiny" type="rounded" mono label={t('U')} />
                {alerter.metrics.updated}
              </span>
            </Tooltip>
          </div>
        </Grid>
      </Grid>
    </Card>
  );
};

const WrappedScalerResourcesCard = ({ scaler }) => {
  const { t } = useTranslation(['dashboard']);
  const classes = useStyles();

  return (
    <Card className={classes.core_card}>
      <div className={classes.title}>{t('resources')}</div>
    </Card>
  );
};

const WrappedServiceCard = ({ service }) => {
  const { t } = useTranslation(['dashboard']);
  const theme = useTheme();
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <div style={{ float: 'right' }}>
        <ErrorOutlineOutlinedIcon />
      </div>
      <div className={classes.title} style={{ paddingBottom: theme.spacing(2) }}>
        {`${service.service_name} :: ${service.instances} / ${service.total || 0}`}
      </div>
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <Tooltip title={t('service.queue')}>
            <span>
              <CustomChip size="tiny" type="rounded" mono label={t('Q')} />
              {service.queue}
            </span>
          </Tooltip>
        </Grid>
        <Grid item xs={6}>
          <Tooltip title={t('service.busy')}>
            <span>
              <CustomChip size="tiny" type="rounded" mono label={t('B')} />
              {service.activity.busy}
            </span>
          </Tooltip>
        </Grid>
        <Grid item xs={6}>
          <Tooltip title={t('service.processed')}>
            <span>
              <CustomChip size="tiny" type="rounded" mono label={t('P')} />
              {service.metrics.execute}
            </span>
          </Tooltip>
        </Grid>
        <Grid item xs={6}>
          <Tooltip title={t('service.failed')}>
            <span>
              <CustomChip size="tiny" type="rounded" mono label={t('F')} />
              {service.metrics.fail_nonrecoverable}
            </span>
          </Tooltip>
        </Grid>
      </Grid>
    </Card>
  );
};

const IngestCard = React.memo(WrappedIngestCard);
const DispatcherCard = React.memo(WrappedDispatcherCard);
const ExpiryCard = React.memo(WrappedExpiryCard);
const AlerterCard = React.memo(WrappedAlerterCard);
const ScalerResourcesCard = React.memo(WrappedScalerResourcesCard);
const ServiceCard = React.memo(WrappedServiceCard);

const basicReducer = (state, newState) => {
  return { ...state, ...newState };
};

const serviceReducer = (state, serviceState) => {
  const { hbType, hb } = serviceState;
  const current = state[hb.service_name] || {};
  if (hbType === 'scaler') {
    const newState = {};
    newState[hb.service_name] = {
      ...DEFAULT_SERVICE,
      ...current,
      service_name: hb.service_name,
      scaler: hb.metrics
    };
    return { ...state, ...newState };
  }

  const newState = {};
  newState[hb.service_name] = {
    ...DEFAULT_SERVICE,
    ...current,
    ...hb,
    last_hb: Math.floor(new Date().getTime() / 1000)
  };
  return { ...state, ...newState };
};

const serviceListReducer = (state, serviceName) => {
  const { up, down, timing } = state;
  const curTime = Math.floor(new Date().getTime() / 1000);
  timing[serviceName] = curTime;
  if (up.indexOf(serviceName) === -1) {
    up.push(serviceName);
  }
  if (down.indexOf(serviceName) !== -1) {
    down.pop(serviceName);
  }

  return { up, down, timing };
};

const DEFAULT_ALERTER = {
  instances: 0,
  queues: {
    alert: 0
  },
  metrics: {
    created: 0,
    error: 0,
    received: 0,
    updated: 0
  }
};

const DEFAULT_DISPATCHER = {
  instances: 0,
  inflight: {
    outstanding: 0,
    max: 0
  },
  queues: {
    ingest: 0
  },
  metrics: {
    files_completed: 0,
    submissions_completed: 0
  }
};

const DEFAULT_EXPIRY = {
  instances: 0,
  queues: {
    alert: 0,
    cached_file: 0,
    emptyresult: 0,
    error: 0,
    file: 0,
    filescore: 0,
    result: 0,
    submission: 0,
    submission_tree: 0,
    submission_summary: 0
  },
  metrics: {
    alert: 0,
    cached_file: 0,
    emptyresult: 0,
    error: 0,
    file: 0,
    filescore: 0,
    result: 0,
    submission: 0,
    submission_tree: 0,
    submission_summary: 0
  },
  archive: {
    alert: 0,
    cached_file: 0,
    emptyresult: 0,
    error: 0,
    file: 0,
    filescore: 0,
    result: 0,
    submission: 0,
    submission_tree: 0,
    submission_summary: 0
  }
};

const DEFAULT_INGESTER = {
  instances: 0,
  metrics: {
    cache_miss: 0,
    cache_expired: 0,
    cache_stale: 0,
    cache_hit_local: 0,
    cache_hit: 0,
    bytes_completed: 0,
    bytes_ingested: 0,
    duplicates: 0,
    error: 0,
    files_completed: 0,
    skipped: 0,
    submissions_completed: 0,
    submissions_ingested: 0,
    timed_out: 0,
    whitelisted: 0
  },
  processing: {
    inflight: 0
  },
  processing_chance: {
    critical: 1,
    high: 1,
    medium: 1,
    low: 1
  },
  queues: {
    ingest: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  }
};

const DEFAULT_SCALER = {
  memory_total: 0,
  memory_free: 0,
  cpu_total: 0,
  cpu_free: 0
};

const DEFAULT_SERVICE = {
  duty_cycle: 0,
  instances: 0,
  last_hb: 0,
  metrics: {
    cache_hit: 0,
    cache_miss: 0,
    cache_skipped: 0,
    execute: 0,
    fail_recoverable: 0,
    fail_nonrecoverable: 0,
    scored: 0,
    not_scored: 0
  },
  scaler: {
    running: 0,
    target: 0,
    minimum: 0,
    maximum: 0,
    dynamic_maximum: 0,
    queue: 0,
    pressure: 0.0,
    duty_cycle: 0.0
  },
  queue: 0,
  activity: {
    busy: 0,
    idle: 0
  },
  service_name: null
};

const DEFAULT_SERVICE_LIST = {
  up: [],
  down: [],
  timing: {}
};

const Dashboard = () => {
  const { t } = useTranslation(['dashboard']);
  const [alerter, setAlerter] = useReducer(basicReducer, DEFAULT_ALERTER);
  const [dispatcher, setDispatcher] = useReducer(basicReducer, DEFAULT_DISPATCHER);
  const [expiry, setExpiry] = useReducer(basicReducer, DEFAULT_EXPIRY);
  const [ingester, setIngester] = useReducer(basicReducer, DEFAULT_INGESTER);
  const [scaler, setScaler] = useReducer(basicReducer, DEFAULT_SCALER);
  const [services, setServices] = useReducer(serviceReducer, {});
  const [servicesList, setServicesList] = useReducer(serviceListReducer, DEFAULT_SERVICE_LIST);

  const handleAlerterHeartbeat = hb => {
    // eslint-disable-next-line no-console
    console.log('Socket-IO :: AlerterHeartbeat', hb);
    setAlerter(hb);
  };

  const handleArchiveHeartbeat = hb => {
    // eslint-disable-next-line no-console
    console.log('Socket-IO :: ArchiveHeartbeat', hb);
    setExpiry({ archive: hb.metrics });
  };

  const handleDispatcherHeartbeat = hb => {
    // eslint-disable-next-line no-console
    console.log('Socket-IO :: DispatcherHeartbeat', hb);
    setDispatcher(hb);
  };

  const handleExpiryHeartbeat = hb => {
    // eslint-disable-next-line no-console
    console.log('Socket-IO :: ExpiryHeartbeat', hb);
    setExpiry(hb);
  };

  const handleIngestHeartbeat = hb => {
    // eslint-disable-next-line no-console
    console.log('Socket-IO :: IngestHeartbeat', hb);
    setIngester(hb);
  };

  const handleScalerHeartbeat = hb => {
    // eslint-disable-next-line no-console
    console.log('Socket-IO :: ScalerHeartbeat', hb);
    setScaler(hb);
  };

  const handleServiceHeartbeat = hb => {
    // eslint-disable-next-line no-console
    console.log(`Socket-IO :: ServiceHeartbeat ${hb.service_name}`, hb);
    setServicesList(hb.service_name);
    setServices({ type: 'service', hb: { ...hb, last_hb: Math.floor(new Date().getTime() / 1000) } });
  };

  const handleScalerStatusHeartbeat = hb => {
    // eslint-disable-next-line no-console
    console.log(`Socket-IO :: ScalerStatusHeartbeat ${hb.service_name}`, hb);
    setServices({ type: 'scaler', hb });
  };

  useEffect(() => {
    const socket = io(NAMESPACE);

    socket.on('connect', () => {
      socket.emit('monitor', { status: 'start' });
      // eslint-disable-next-line no-console
      console.log('Socket-IO :: Connecting to socketIO server...');
    });
    // eslint-disable-next-line no-console
    socket.on('monitoring', data => console.log('Socket-IO :: Connected to socket server', data));

    socket.on('AlerterHeartbeat', handleAlerterHeartbeat);
    socket.on('ArchiveHeartbeat', handleArchiveHeartbeat);
    socket.on('DispatcherHeartbeat', handleDispatcherHeartbeat);
    socket.on('ExpiryHeartbeat', handleExpiryHeartbeat);
    socket.on('IngestHeartbeat', handleIngestHeartbeat);
    socket.on('ScalerHeartbeat', handleScalerHeartbeat);
    socket.on('ScalerStatusHeartbeat', handleScalerStatusHeartbeat);
    socket.on('ServiceHeartbeat', handleServiceHeartbeat);
  }, []);

  return (
    <PageFullscreen margin={4}>
      <Typography gutterBottom color="primary" variant="h2" align="center">
        {t('title')}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} xl={6}>
          <IngestCard ingester={ingester} />
        </Grid>
        <Grid item xs={12} xl={6}>
          <DispatcherCard dispatcher={dispatcher} up={servicesList.up} down={servicesList.down} />
        </Grid>
        <Grid item xs={12} xl={5}>
          <ExpiryCard expiry={expiry} />
        </Grid>
        <Grid item xs={12} md={8} xl={4}>
          <AlerterCard alerter={alerter} />
        </Grid>
        <Grid item xs={12} md={4} xl={3}>
          <ScalerResourcesCard scaler={scaler} />
        </Grid>
        {Object.keys(services).map(key => (
          <Grid key={key} item xs={12} md={4} xl={3}>
            <ServiceCard service={services[key]} />
          </Grid>
        ))}
      </Grid>
    </PageFullscreen>
  );
};

export default Dashboard;
