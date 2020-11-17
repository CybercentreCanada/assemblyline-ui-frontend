import { Card, makeStyles, Typography } from '@material-ui/core';
import PageFullscreen from 'commons/components/layout/pages/PageFullScreen';
import React from 'react';
import { useTranslation } from 'react-i18next';

function createData(id) {
  return { id };
}

const useStyles = makeStyles(theme => ({
  card: {
    flexGrow: 1,
    minHeight: '175px',
    minWidth: '320px',
    padding: theme.spacing(2),
    margin: theme.spacing(1)
  },
  watermark: {
    color: theme.palette.action.disabledBackground,
    margin: 'auto',
    width: '275px',
    lineHeight: '155px',
    textAlign: 'center'
  }
}));

const IngestCard = () => {
  const { t } = useTranslation(['dashboard']);
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <Typography variant="h4" className={classes.watermark}>
        {t('ingest')}
      </Typography>
    </Card>
  );
};

const DispatcherCard = () => {
  const { t } = useTranslation(['dashboard']);
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <Typography variant="h4" className={classes.watermark}>
        {t('dispatcher')}
      </Typography>
    </Card>
  );
};

const ExpiryCard = () => {
  const { t } = useTranslation(['dashboard']);
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <Typography variant="h4" className={classes.watermark}>
        {t('expiry')}
      </Typography>
    </Card>
  );
};

const AlerterCard = () => {
  const { t } = useTranslation(['dashboard']);
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <Typography variant="h4" className={classes.watermark}>
        {t('alerter')}
      </Typography>
    </Card>
  );
};

const ScalerResourcesCard = () => {
  const { t } = useTranslation(['dashboard']);
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <Typography variant="h4" className={classes.watermark}>
        {t('resources')}
      </Typography>
    </Card>
  );
};

const ServiceCard = ({ service = null }) => {
  const { t } = useTranslation(['dashboard']);
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <Typography variant="h4" className={classes.watermark}>
        {t(service)}
      </Typography>
    </Card>
  );
};

const Dashboard = () => {
  const { t } = useTranslation(['dashboard']);

  const cards = [];
  for (let x = 0; x < 12; x++) {
    cards.push(createData(x + 1));
  }

  return (
    <PageFullscreen margin={4}>
      <Typography gutterBottom color="primary" variant="h2" align="center">
        {t('title')}
      </Typography>
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', width: '100%' }}>
        <IngestCard />
        <DispatcherCard />
        <ExpiryCard />
        <AlerterCard />
        <ScalerResourcesCard />
        {cards.map((a, i) => (
          <ServiceCard key={i} service={`service_${a.id}`} />
        ))}
      </div>
    </PageFullscreen>
  );
};

export default Dashboard;
