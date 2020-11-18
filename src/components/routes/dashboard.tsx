import { Card, Grid, makeStyles, Typography, useTheme } from '@material-ui/core';
import ErrorOutlineOutlinedIcon from '@material-ui/icons/ErrorOutlineOutlined';
import PageFullscreen from 'commons/components/layout/pages/PageFullScreen';
import React, { useEffect, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import io from 'socket.io-client';

const NAMESPACE = '/status';

const useStyles = makeStyles(theme => ({
  card: {
    flexGrow: 1,
    padding: theme.spacing(1)
    // minHeight: '175px'
  },
  core_card: {
    flexGrow: 1,
    padding: theme.spacing(1),
    minHeight: '150px'
  },
  title: {
    fontWeight: 800,
    fontSize: '120%'
  }
}));

const IngestCard = () => {
  const { t } = useTranslation(['dashboard']);
  const classes = useStyles();

  return (
    <Card className={classes.core_card}>
      <div className={classes.title}>{t('ingest')}</div>
    </Card>
  );
};

const DispatcherCard = () => {
  const { t } = useTranslation(['dashboard']);
  const classes = useStyles();

  return (
    <Card className={classes.core_card}>
      <div className={classes.title}>{t('dispatcher')}</div>
    </Card>
  );
};

const ExpiryCard = () => {
  const { t } = useTranslation(['dashboard']);
  const classes = useStyles();

  return (
    <Card className={classes.core_card}>
      <div className={classes.title}>{t('expiry')}</div>
    </Card>
  );
};

const AlerterCard = () => {
  const { t } = useTranslation(['dashboard']);
  const classes = useStyles();

  return (
    <Card className={classes.core_card}>
      <div className={classes.title}>{t('alerter')}</div>
    </Card>
  );
};

const ScalerResourcesCard = () => {
  const { t } = useTranslation(['dashboard']);
  const classes = useStyles();

  return (
    <Card className={classes.core_card}>
      <div className={classes.title}>{t('resources')}</div>
    </Card>
  );
};

const ServiceCard = ({ service = null }) => {
  const { t } = useTranslation(['dashboard']);
  const theme = useTheme();
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <div>
        <div style={{ float: 'right' }}>
          <ErrorOutlineOutlinedIcon />
        </div>
        <div className={classes.title} style={{ paddingBottom: theme.spacing(2) }}>
          {`${service.service_name} :: ${service.instances} / ${service.total || 0}`}
        </div>
        <Grid container>
          <Grid item xs={6}>
            <span>{`Q: ${service.queue}`}</span>
          </Grid>
          <Grid item xs={6}>
            <span>{`B: ${service.activity.busy}`}</span>
          </Grid>
          <Grid item xs={6}>
            <span>{`P: ${service.metrics.execute}`}</span>
          </Grid>
          <Grid item xs={6}>
            <span>{`F: ${service.metrics.fail_nonrecoverable}`}</span>
          </Grid>
        </Grid>
      </div>
    </Card>
  );
};

const serviceReducer = (state, newState) => {
  return { ...state, ...newState };
};

const Dashboard = () => {
  const { t } = useTranslation(['dashboard']);
  const [services, setServices] = useReducer(serviceReducer, {});

  const handleServiceHeartbeat = hb => {
    // eslint-disable-next-line no-console
    console.log(`Socket-IO :: ServiceHeartbeat ${hb.service_name}`, hb);
    const newServices = {};
    newServices[hb.service_name] = hb;
    setServices(newServices);
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

    socket.on('DispatcherHeartbeat', data => console.log('DispatcherHeartbeat', data));
    socket.on('AlerterHeartbeat', data => console.log('AlerterHeartbeat', data));
    socket.on('ExpiryHeartbeat', data => console.log('ExpiryHeartbeat', data));
    socket.on('ArchiveHeartbeat', data => console.log('ArchiveHeartbeat', data));
    socket.on('ScalerHeartbeat', data => console.log('ScalerHeartbeat', data));
    socket.on('ScalerStatusHeartbeat', data => console.log('ScalerStatusHeartbeat', data));
    socket.on('IngestHeartbeat', data => console.log('IngestHeartbeat', data));
    socket.on('ServiceHeartbeat', handleServiceHeartbeat);
  }, []);

  return (
    <PageFullscreen margin={4}>
      <Typography gutterBottom color="primary" variant="h2" align="center">
        {t('title')}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} xl={6}>
          <IngestCard />
        </Grid>
        <Grid item xs={12} xl={6}>
          <DispatcherCard />
        </Grid>
        <Grid item xs={12} xl={5}>
          <ExpiryCard />
        </Grid>
        <Grid item xs={12} md={8} xl={4}>
          <AlerterCard />
        </Grid>
        <Grid item xs={12} md={4} xl={3}>
          <ScalerResourcesCard />
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
