import {
  Button,
  Card,
  Grid,
  IconButton,
  makeStyles,
  MenuItem,
  Select,
  Tooltip,
  Typography,
  useTheme
} from '@material-ui/core';
import RemoveCircleOutlineOutlinedIcon from '@material-ui/icons/RemoveCircleOutlineOutlined';
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
      backgroundColor: theme.palette.type === 'dark' ? '#ffffff10' : '#00000005',
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
  onChange: (newContainer: Container, name?: string, newVolumes?: { [name: string]: Volume }) => void;
};

const WrappedContainerCard = ({ container, name, volumes, onChange }: ContainerCardProps) => {
  const { t } = useTranslation(['adminServices']);
  const theme = useTheme();
  const classes = useStyles();
  const yesColor = theme.palette.type === 'dark' ? theme.palette.success.light : theme.palette.success.dark;
  const noColor = theme.palette.type === 'dark' ? theme.palette.error.light : theme.palette.error.dark;

  const handleContainerEdit = () => {
    onChange(container, name, volumes);
  };

  return (
    <div style={{ paddingTop: theme.spacing(1) }}>
      <Card className={classes.card} onClick={handleContainerEdit}>
        <Grid container>
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
              <i>{t('container.card.creds')}</i>
            </Grid>
          )}
          <Grid item xs={12} style={{ paddingTop: theme.spacing(1), paddingBottom: theme.spacing(1) }}>
            <Tooltip title={t('container.card.cpu')}>
              <div style={{ display: 'inline-block', paddingRight: theme.spacing(4) }}>
                <CgSmartphoneChip size={24} style={{ verticalAlign: 'middle' }} />
                <span style={{ paddingLeft: theme.spacing(1), verticalAlign: 'middle' }}>{container.cpu_cores}</span>
              </div>
            </Tooltip>
            <Tooltip title={t('container.card.ram')}>
              <div style={{ display: 'inline-block' }}>
                <CgSmartphoneRam size={24} style={{ verticalAlign: 'middle' }} />
                <span style={{ paddingLeft: theme.spacing(1), verticalAlign: 'middle' }}>{container.ram_mb}</span>
              </div>
            </Tooltip>
          </Grid>
          {container.command && (
            <>
              <Grid item xs={5} sm={4} md={2} className={classes.label}>{`${t('container.card.command')}:`}</Grid>
              <Grid item xs={7} sm={8} md={10} className={classes.mono}>
                {container.command}
              </Grid>
            </>
          )}
          <Grid item xs={5} sm={4} md={2} className={classes.label}>{`${t('container.card.internet')}:`}</Grid>
          <Grid
            item
            xs={7}
            sm={8}
            md={10}
            className={classes.mono}
            style={{ color: container.allow_internet_access ? yesColor : noColor }}
          >
            {container.allow_internet_access ? t('container.card.yes') : t('container.card.no')}
          </Grid>
          {container.environment && container.environment.length !== 0 && (
            <Grid item xs={12}>
              <div className={classes.label}>{`${t('container.card.env')}:`}&nbsp;</div>
              {container.environment.map((env, id) => {
                return (
                  <div key={id} className={classes.mono} style={{ paddingLeft: '2rem' }}>
                    {`${env.name} = ${env.value}`}
                  </div>
                );
              })}
            </Grid>
          )}
          {volumes && Object.keys(volumes).length !== 0 && (
            <Grid item xs={12}>
              <div className={classes.label}>{`${t('container.card.volumes')}:`}&nbsp;</div>
              {Object.keys(volumes).map((vol, id) => {
                return (
                  <div key={id} className={classes.mono} style={{ paddingLeft: '2rem' }}>
                    {`${vol} = ${volumes[vol].mount_path} (${volumes[vol].capacity})`}
                  </div>
                );
              })}
            </Grid>
          )}
        </Grid>
      </Card>
    </div>
  );
};

WrappedContainerCard.defaultProps = {
  name: null,
  volumes: null
};

const ContainerCard = React.memo(WrappedContainerCard);

const ServiceContainer = ({ service, setService, setModified }: ServiceContainerProps) => {
  const { t } = useTranslation(['adminServices']);
  const theme = useTheme();

  const handleChannelChange = event => {
    setModified(true);
    setService({ ...service, update_channel: event.target.value });
  };

  const onDependencyDelete = name => {
    const depList = { ...service.dependencies };
    delete depList[name];
    setModified(true);
    setService({ ...service, dependencies: depList });
  };

  const handleContainerImageChange = newContainer => {
    setModified(true);
    setService({ ...service, docker_config: newContainer });
  };

  const handleDependencyChange = (newDep, name, newVolumes) => {
    const depList = { ...service.dependencies };
    depList[name] = { container: newDep, volumes: newVolumes };
    setModified(true);
    setService({ ...service, dependencies: depList });
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
          <ContainerCard container={service.docker_config} onChange={handleContainerImageChange} />
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
                <div key={name} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ paddingRight: theme.spacing(1) }}>
                    <ContainerCard
                      name={name}
                      container={service.dependencies[name].container}
                      volumes={service.dependencies[name].volumes}
                      onChange={handleDependencyChange}
                    />
                  </div>
                  <div>
                    <Tooltip title={t('container.dependencies.remove')}>
                      <IconButton
                        style={{
                          color: theme.palette.type === 'dark' ? theme.palette.error.light : theme.palette.error.dark
                        }}
                        onClick={() => onDependencyDelete(name)}
                      >
                        <RemoveCircleOutlineOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                  </div>
                </div>
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
