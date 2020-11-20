import { Card, Grid, makeStyles, Theme, Tooltip, Typography } from '@material-ui/core';
import ErrorOutlineOutlinedIcon from '@material-ui/icons/ErrorOutlineOutlined';
import SpeedOutlinedIcon from '@material-ui/icons/SpeedOutlined';
import PageFullscreen from 'commons/components/layout/pages/PageFullScreen';
import ArcGauge from 'components/visual/ArcGauge';
import CustomChip from 'components/visual/CustomChip';
import React, { useEffect, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import io from 'socket.io-client';

const NAMESPACE = '/status';

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    flexGrow: 1,
    padding: theme.spacing(1),
    minHeight: '120px',
    '&:hover': {
      boxShadow: theme.shadows[6]
    }
  },
  core_card: {
    flexGrow: 1,
    padding: theme.spacing(1),
    minHeight: '170px',
    '&:hover': {
      boxShadow: theme.shadows[6]
    }
  },
  error: {
    backgroundColor: theme.palette.type === 'dark' ? '#ff000017' : '#FFE4E4',
    border: `solid 1px ${theme.palette.type === 'dark' ? theme.palette.error.light : theme.palette.error.dark}`
  },
  error_icon: {
    color: theme.palette.type === 'dark' ? theme.palette.error.light : theme.palette.error.dark,
    float: 'right'
  },
  icon: {
    marginRight: '4px',
    verticalAlign: 'middle',
    height: '20px',
    color: theme.palette.action.active
  },
  metric: {
    display: 'inline-block',
    marginRight: theme.spacing(1)
  },
  muted: {
    color: theme.palette.text.secondary
  },
  ok: {
    border: `solid 1px ${theme.palette.divider}`
  },
  title: {
    fontWeight: 500,
    fontSize: '120%'
  }
}));

const WrappedMetricCounter = ({ value, title, tooltip }) => {
  const classes = useStyles();

  return (
    <Tooltip title={tooltip}>
      <span className={classes.metric}>
        <CustomChip size="tiny" type="rounded" mono label={title} />
        {value}
      </span>
    </Tooltip>
  );
};
const MetricCounter = React.memo(WrappedMetricCounter);

const WrappedIngestCard = ({ ingester }) => {
  const { t } = useTranslation(['dashboard']);
  const classes = useStyles();

  return (
    <Card className={`${classes.core_card} ${ingester.error ? classes.error : classes.ok}`}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          {ingester.error && (
            <div className={classes.error_icon}>
              <ErrorOutlineOutlinedIcon />
            </div>
          )}
          <div className={classes.title}>{`${t('ingester')} :: x${ingester.instances}`}</div>
        </Grid>
        <Grid item xs={12} sm={3}>
          <div>
            <label>{t('ingest')}</label>
          </div>
          <div>
            <MetricCounter value={ingester.queues.ingest} title="Q" tooltip={t('ingest.queue')} />
          </div>
        </Grid>
        <Grid item xs={12} sm={6}>
          <div>
            <label>{t('queued')}</label>
          </div>
          <div>
            <MetricCounter value={ingester.queues.critical} title="C" tooltip={t('ingest.critical')} />
            <MetricCounter value={ingester.queues.high} title="H" tooltip={t('ingest.high')} />
            <MetricCounter value={ingester.queues.medium} title="M" tooltip={t('ingest.medium')} />
            <MetricCounter value={ingester.queues.low} title="L" tooltip={t('ingest.low')} />
          </div>
        </Grid>
        <Grid item xs={12} sm={3}>
          <div>
            <label>{t('processing')}</label>
          </div>
          <div>
            <MetricCounter value={ingester.processing.inflight} title="I" tooltip={t('processing.inflight')} />
          </div>
        </Grid>
        <Grid item xs={12} sm={3}>
          <div>
            <label>{t('caching')}</label>
          </div>
          <div>
            <MetricCounter value={ingester.metrics.cache_hit} title="H" tooltip={t('caching.hits')} />
            <MetricCounter value={ingester.metrics.cache_miss} title="M" tooltip={t('caching.miss')} />
          </div>
        </Grid>
        <Grid item xs={12} sm={9}>
          <div>
            <label>{t('throughput')}</label>
          </div>
          <div>
            <MetricCounter
              value={ingester.metrics.files_completed}
              title="F"
              tooltip={t('throughput.files_completed')}
            />
            <MetricCounter
              value={ingester.metrics.submissions_completed}
              title="C"
              tooltip={t('throughput.submissions_completed')}
            />
            <MetricCounter value={ingester.metrics.whitelisted} title="W" tooltip={t('throughput.whitelisted')} />
            <MetricCounter value={ingester.metrics.skipped} title="S" tooltip={t('throughput.skipped')} />
            <MetricCounter value={ingester.metrics.duplicates} title="D" tooltip={t('throughput.duplicates')} />
            <MetricCounter value={ingester.metrics.error} title="E" tooltip={t('throughput.error')} />
            <Tooltip title={t('throughput.bytes')}>
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
    <Card className={`${classes.core_card} ${dispatcher.error ? classes.error : classes.ok}`}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          {dispatcher.error && (
            <div className={classes.error_icon}>
              <ErrorOutlineOutlinedIcon />
            </div>
          )}
          <div className={classes.title}>{`${t('dispatcher')} :: x${dispatcher.instances}`}</div>
        </Grid>
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
            <MetricCounter
              value={
                <span>
                  {dispatcher.inflight.outstanding} / {dispatcher.inflight.max}
                </span>
              }
              title="O"
              tooltip={t('submissions.outstanding')}
            />
          </div>
        </Grid>
        <Grid item xs={12} sm={3}>
          <div>
            <label>{t('queues')}</label>
          </div>
          <div>
            <MetricCounter value={dispatcher.queues.ingest} title="I" tooltip={t('queues.ingest')} />
          </div>
        </Grid>
        <Grid item xs={12} sm={6}>
          <div>
            <label>{t('throughput')}</label>
          </div>
          <div>
            <MetricCounter
              value={dispatcher.metrics.files_completed}
              title="F"
              tooltip={t('throughput.files_completed')}
            />
            <MetricCounter
              value={dispatcher.metrics.submissions_completed}
              title="S"
              tooltip={t('throughput.submissions_completed')}
            />
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
    <Card className={`${classes.core_card} ${expiry.error ? classes.error : classes.ok}`}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          {expiry.error && (
            <div className={classes.error_icon}>
              <ErrorOutlineOutlinedIcon />
            </div>
          )}
          <div className={classes.title}>{`${t('expiry')} :: x${expiry.instances}`}</div>
        </Grid>
        <Grid item xs={12} sm={6}>
          <div>
            <label>{t('queues')}</label>
          </div>
          <div>
            <MetricCounter value={expiry.queues.alert} title="A" tooltip={t('queues.alert')} />
            <MetricCounter value={expiry.queues.error} title="E" tooltip={t('queues.error')} />
            <MetricCounter
              value={expiry.queues.cached_file + expiry.queues.file + expiry.queues.filescore}
              title="F"
              tooltip={t('queues.file')}
            />
            <MetricCounter
              value={expiry.queues.result + expiry.queues.emptyresult}
              title="R"
              tooltip={t('queues.result')}
            />
            <MetricCounter
              value={expiry.queues.submission + expiry.queues.submission_summary + expiry.queues.submission_tree}
              title="S"
              tooltip={t('queues.submission')}
            />
          </div>
        </Grid>
        <Grid item xs={12} sm={6}>
          <div>
            <label>{t('expired')}</label>
          </div>
          <div>
            <MetricCounter value={expiry.metrics.alert} title="A" tooltip={t('expired.alert')} />
            <MetricCounter value={expiry.metrics.error} title="E" tooltip={t('expired.error')} />
            <MetricCounter
              value={expiry.metrics.cached_file + expiry.metrics.file + expiry.metrics.filescore}
              title="F"
              tooltip={t('expired.file')}
            />
            <MetricCounter
              value={expiry.metrics.result + expiry.metrics.emptyresult}
              title="R"
              tooltip={t('expired.result')}
            />
            <MetricCounter
              value={expiry.metrics.submission + expiry.metrics.submission_summary + expiry.metrics.submission_tree}
              title="S"
              tooltip={t('expired.submission')}
            />
          </div>
        </Grid>
        <Grid item xs={12} sm={6} />
        <Grid item xs={12} sm={6}>
          <div>
            <label>{t('archived')}</label>
          </div>
          <div>
            <MetricCounter value={expiry.archive.alert} title="A" tooltip={t('archived.alert')} />
            <MetricCounter value={expiry.archive.error} title="E" tooltip={t('archived.error')} />
            <MetricCounter
              value={expiry.archive.cached_file + expiry.archive.file + expiry.archive.filescore}
              title="F"
              tooltip={t('archived.file')}
            />
            <MetricCounter
              value={expiry.archive.result + expiry.archive.emptyresult}
              title="R"
              tooltip={t('archived.result')}
            />
            <MetricCounter
              value={expiry.archive.submission + expiry.archive.submission_summary + expiry.archive.submission_tree}
              title="S"
              tooltip={t('archived.submission')}
            />
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
    <Card className={`${classes.core_card} ${alerter.error ? classes.error : classes.ok}`}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          {alerter.error && (
            <div className={classes.error_icon}>
              <ErrorOutlineOutlinedIcon />
            </div>
          )}
          <div className={classes.title}>{`${t('alerter')} :: x${alerter.instances}`}</div>
        </Grid>
        <Grid item xs={12} sm={4}>
          <div>
            <label>{t('queues')}</label>
          </div>
          <div>
            <MetricCounter value={alerter.queues.alert} title="A" tooltip={t('queues.alert')} />
          </div>
        </Grid>
        <Grid item xs={12} sm={8}>
          <div>
            <label>{t('throughput')}</label>
          </div>
          <div>
            <MetricCounter value={alerter.metrics.created} title="C" tooltip={t('throughput.created')} />
            <MetricCounter value={alerter.metrics.error} title="E" tooltip={t('throughput.error')} />
            <MetricCounter value={alerter.metrics.received} title="R" tooltip={t('throughput.received')} />
            <MetricCounter value={alerter.metrics.updated} title="U" tooltip={t('throughput.updated')} />
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
    <Card className={`${classes.core_card} ${scaler.error ? classes.error : classes.ok}`}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          {scaler.error && (
            <div className={classes.error_icon}>
              <ErrorOutlineOutlinedIcon />
            </div>
          )}
          <div className={classes.title}>{t('resources')}</div>
        </Grid>
        <Grid item xs={6} style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-block' }}>
            <ArcGauge
              pctValue={scaler.cpu_total === 0 ? 0 : ((scaler.cpu_total - scaler.cpu_free) / scaler.cpu_total) * 100}
              title={t('cpu')}
              caption={`${scaler.cpu_total - scaler.cpu_free} / ${scaler.cpu_total} ${t('cores')}`}
              width="120px"
            />
          </div>
        </Grid>
        <Grid item xs={6} style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-block' }}>
            <ArcGauge
              pctValue={
                scaler.memory_total === 0 ? 0 : ((scaler.memory_total - scaler.memory_free) / scaler.memory_total) * 100
              }
              title={t('ram')}
              caption={`${scaler.memory_total - scaler.memory_free} / ${scaler.memory_total} ${t('gb')}`}
              width="120px"
            />
          </div>
        </Grid>
      </Grid>
    </Card>
  );
};

const WrappedServiceCard = ({ service }) => {
  const { t } = useTranslation(['dashboard']);
  const classes = useStyles();

  return (
    <Card className={`${classes.card} ${service.error ? classes.error : classes.ok}`}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          {service.error && (
            <div className={classes.error_icon}>
              <ErrorOutlineOutlinedIcon />
            </div>
          )}
          <div className={classes.title}>
            {`${service.service_name} :: ${service.instances} / ${service.total || 0}`}
          </div>
        </Grid>
        <Grid item xs={6}>
          <MetricCounter value={service.queue} title="Q" tooltip={t('service.queue')} />
        </Grid>
        <Grid item xs={6}>
          <MetricCounter value={service.activity.busy} title="B" tooltip={t('service.busy')} />
        </Grid>
        <Grid item xs={6}>
          <MetricCounter value={service.metrics.execute} title="P" tooltip={t('service.processed')} />
        </Grid>
        <Grid item xs={6}>
          <MetricCounter value={service.metrics.fail_nonrecoverable} title="F" tooltip={t('service.failed')} />
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
    ...hb
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
  },
  error: null,
  initialized: false
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
  },
  error: null,
  initialized: false
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
  },
  error: null,
  initialized: false
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
  },
  error: null,
  initialized: false
};

const DEFAULT_SCALER = {
  memory_total: 0,
  memory_free: 0,
  cpu_total: 0,
  cpu_free: 0,
  error: null,
  initialized: false
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
  service_name: null,
  error: null
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
    setAlerter({ ...hb, initialized: true });
  };

  const handleArchiveHeartbeat = hb => {
    // eslint-disable-next-line no-console
    console.log('Socket-IO :: ArchiveHeartbeat', hb);
    setExpiry({ archive: hb.metrics, initialized: true });
  };

  const handleDispatcherHeartbeat = hb => {
    // eslint-disable-next-line no-console
    console.log('Socket-IO :: DispatcherHeartbeat', hb);
    setDispatcher({ ...hb, initialized: true });
  };

  const handleExpiryHeartbeat = hb => {
    // eslint-disable-next-line no-console
    console.log('Socket-IO :: ExpiryHeartbeat', hb);
    setExpiry({ ...hb, initialized: true });
  };

  const handleIngestHeartbeat = hb => {
    // eslint-disable-next-line no-console
    console.log('Socket-IO :: IngestHeartbeat', hb);
    setIngester({ ...hb, initialized: true });
  };

  const handleScalerHeartbeat = hb => {
    // eslint-disable-next-line no-console
    console.log('Socket-IO :: ScalerHeartbeat', hb);
    setScaler({ ...hb, initialized: true });
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
