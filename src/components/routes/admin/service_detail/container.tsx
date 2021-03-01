import { Button, Grid, IconButton, MenuItem, Select, Tooltip, Typography, useTheme } from '@material-ui/core';
import RemoveCircleOutlineOutlinedIcon from '@material-ui/icons/RemoveCircleOutlineOutlined';
import { Skeleton } from '@material-ui/lab';
import 'moment/locale/fr';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ServiceDetail } from '../service_detail';
import ContainerCard from './container_card';
import ContainerDialog from './container_dialog';

type ServiceContainerProps = {
  service: ServiceDetail;
  setService: (value: ServiceDetail) => void;
  setModified: (value: boolean) => void;
};

const ServiceContainer = ({ service, setService, setModified }: ServiceContainerProps) => {
  const { t } = useTranslation(['adminServices']);
  const [dialog, setDialog] = useState(false);
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
            {/* <MenuItem value="rc">{t('container.channel.rc')}</MenuItem> */}
            {/* <MenuItem value="beta">{t('container.channel.beta')}</MenuItem> */}
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
                  <div style={{ paddingRight: theme.spacing(1), flexGrow: 1 }}>
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
        <ContainerDialog open={dialog} setOpen={setDialog} name="" volumes={{}} onSave={handleDependencyChange} />
        <Button variant="contained" color="primary" onClick={() => setDialog(true)}>
          {t('container.dependencies.add')}
        </Button>
      </Grid>
    </Grid>
  );
};

export default ServiceContainer;
