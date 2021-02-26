import { Button, Card, Grid, makeStyles, MenuItem, Select, Typography, useTheme } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import 'moment/locale/fr';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { CgSmartphoneChip, CgSmartphoneRam } from 'react-icons/cg';
import { Container, ServiceDetail, Volume } from '../service_detail';

const useStyles = makeStyles(theme => ({
  card: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '4px',
    padding: '8px',
    margin: '0.25rem 0',
    overflow: 'auto',
    wordBreak: 'break-word',
    '&:hover': {
      backgroundColor: theme.palette.type === 'dark' ? '#ffffff10' : '#00000010',
      cursor: 'pointer'
    }
  },
  card_title: {
    fontSize: 'large',
    fontFamily: 'monospace'
  },
  label: {
    fontWeight: 500
  },
  mono: {
    fontSize: 'larger',
    fontFamily: 'monospace'
  }
}));

type ServiceContainerProps = {
  service: ServiceDetail;
  setService: (value: ServiceDetail) => void;
  setModified: (value: boolean) => void;
};

type ContainerCardProps = {
  container: Container;
  name?: string;
  volumes?: { [name: string]: Volume };
  onClick: () => void;
};

const ContainerCard = ({ container, name, volumes, onClick }: ContainerCardProps) => {
  const { t } = useTranslation(['adminServices']);
  const theme = useTheme();
  const classes = useStyles();

  return (
    <div style={{ paddingTop: theme.spacing(1) }}>
      <Card className={classes.card} onClick={onClick}>
        <Grid container spacing={1}>
          {name && (
            <Grid item xs={12} className={classes.card_title} style={{ fontWeight: 700 }}>
              {name}
            </Grid>
          )}
          <Grid item xs={12} className={classes.card_title}>
            {container.image}
          </Grid>
          {container.registry_password && container.registry_username && (
            <Grid item xs={12}>
              <i>{t('container.registry.creds')}</i>
            </Grid>
          )}
          <Grid item xs={12}>
            <div style={{ display: 'inline-block', paddingRight: theme.spacing(4) }}>
              <CgSmartphoneChip size={24} style={{ verticalAlign: 'middle' }} />
              <span style={{ paddingLeft: theme.spacing(1), verticalAlign: 'middle' }}>{container.cpu_cores}</span>
            </div>
            <div style={{ display: 'inline-block' }}>
              <CgSmartphoneRam size={24} style={{ verticalAlign: 'middle' }} />
              <span style={{ paddingLeft: theme.spacing(1), verticalAlign: 'middle' }}>{container.ram_mb}</span>
            </div>
          </Grid>
        </Grid>
        {/* <div style={{ paddingBottom: theme.spacing(2) }}>
          <div style={{ float: 'right' }}>
            {source.private_key && (
              <Tooltip title={t('private_key_used')}>
                <VpnKeyOutlinedIcon color="action" style={{ marginLeft: theme.spacing(0.5) }} />
              </Tooltip>
            )}
            {source.ca_cert && (
              <Tooltip title={t('ca_used')}>
                <CardMembershipOutlinedIcon color="action" style={{ marginLeft: theme.spacing(0.5) }} />
              </Tooltip>
            )}
            {source.proxy && (
              <Tooltip title={t('proxy_used')}>
                <DnsOutlinedIcon color="action" style={{ marginLeft: theme.spacing(0.5) }} />
              </Tooltip>
            )}
            {source.ssl_ignore_errors && (
              <Tooltip title={t('ignore_ssl_used')}>
                <NoEncryptionOutlinedIcon color="action" style={{ marginLeft: theme.spacing(0.5) }} />
              </Tooltip>
            )}
          </div>
          <span className={classes.card_title}>{source.name}&nbsp;</span>
          <span className={classes.mono}>({source.uri})</span>
        </div> */}
      </Card>
    </div>
  );
};

ContainerCard.defaultProps = {
  name: null,
  volumes: null
};

const ServiceContainer = ({ service, setService, setModified }: ServiceContainerProps) => {
  const { t } = useTranslation(['adminServices']);
  const theme = useTheme();

  const handleChannelChange = event => {
    setModified(true);
    setService({ ...service, update_channel: event.target.value });
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h6">{t('container')}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="subtitle2">{t('container.channel')}</Typography>
        {service ? (
          <Select
            id="channel"
            fullWidth
            value={service.update_channel}
            onChange={handleChannelChange}
            variant="outlined"
            margin="dense"
            style={{ marginTop: theme.spacing(1), marginBottom: theme.spacing(0.5) }}
          >
            <MenuItem value="stable">{t('container.channel.stable')}</MenuItem>
            {/* <MenuItem value="rc">{service.version}</MenuItem> */}
            {/* <MenuItem value="beta">{service.version}</MenuItem> */}
            <MenuItem value="dev">{t('container.channel.dev')}</MenuItem>
          </Select>
        ) : (
          <Skeleton style={{ height: '2.5rem' }} />
        )}
      </Grid>
      <Grid item xs={12}>
        <Typography variant="subtitle2">{t('container.image')}</Typography>
        {service ? (
          <ContainerCard container={service.docker_config} onClick={() => console.log(service.docker_config)} />
        ) : (
          <Skeleton style={{ height: '8rem' }} />
        )}
      </Grid>
      <Grid item xs={12}>
        <Typography variant="subtitle2">{t('container.dependencies')}</Typography>
        {service ? (
          Object.keys(service.dependencies).length !== 0 ? (
            Object.keys(service.dependencies).map(name => {
              return (
                <ContainerCard
                  key={name}
                  name={name}
                  container={service.dependencies[name].container}
                  volumes={service.dependencies[name].volumes}
                  onClick={() => console.log(name)}
                />
              );
            })
          ) : (
            <Typography color="textSecondary" variant="caption" component="div">
              {t('container.dependencies.none')}
            </Typography>
          )
        ) : (
          <Skeleton style={{ height: '8rem' }} />
        )}
      </Grid>
      <Grid item xs={12}>
        <Button variant="contained" color="primary">
          {t('container.dependencies.add')}
        </Button>
      </Grid>
    </Grid>
  );
};

export default ServiceContainer;
