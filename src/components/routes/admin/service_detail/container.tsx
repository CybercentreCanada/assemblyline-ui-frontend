import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import { Button, Grid, IconButton, Skeleton, Tooltip, Typography, useTheme } from '@mui/material';
import type { Service } from 'components/models/base/service';
import ContainerCard from 'components/routes/admin/service_detail/container_card';
import ContainerDialog from 'components/routes/admin/service_detail/container_dialog';
import { showReset } from 'components/routes/admin/service_detail/service.utils';
import { RadioInput } from 'components/visual/Inputs/RadioInput';
import { SelectInput } from 'components/visual/Inputs/SelectInput';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type ServiceContainerProps = {
  service: Service;
  defaults: Service;
  setService: (value: Service) => void;
  setModified: (value: boolean) => void;
};

const ServiceContainer = ({ service, defaults, setService, setModified }: ServiceContainerProps) => {
  const { t } = useTranslation(['adminServices']);
  const theme = useTheme();

  const [dialog, setDialog] = useState<boolean>(false);

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
      <Grid size={{ xs: 12 }}>
        <Typography variant="h6">{t('container')}</Typography>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <SelectInput
          label={t('container.channel')}
          loading={!service}
          value={!service ? null : service.update_channel}
          reset={showReset(service, defaults, 'update_channel')}
          options={
            [
              { value: 'stable', primary: t('container.channel.stable') },
              { value: 'dev', primary: t('container.channel.dev') }
            ] as { value: Service['update_channel']; primary: string }[]
          }
          onChange={(e, v) => {
            setModified(true);
            setService({ ...service, update_channel: v });
          }}
          onReset={() => {
            setModified(true);
            setService({ ...service, update_channel: defaults.update_channel });
          }}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <RadioInput
          label={t('container.privileged')}
          loading={!service}
          value={!service ? null : service.privileged}
          reset={showReset(service, defaults, 'privileged')}
          options={
            [
              { value: true, label: t('container.privileged.true') },
              { value: false, label: t('container.privileged.false') }
            ] as const
          }
          onChange={(e, v) => {
            setModified(true);
            setService({ ...service, privileged: v });
          }}
          onReset={() => {
            setModified(true);
            setService({ ...service, privileged: !!defaults.privileged });
          }}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Typography variant="subtitle2">{t('container.image')}</Typography>
        {service ? (
          <ContainerCard
            container={service.docker_config}
            defaults={defaults ? defaults.docker_config : null}
            onChange={handleContainerImageChange}
          />
        ) : (
          <Skeleton style={{ height: '8rem' }} />
        )}
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Typography variant="subtitle2">{t('container.dependencies')}</Typography>
        {service ? (
          Object.keys(service.dependencies).length !== 0 ? (
            Object.keys(service.dependencies).map(name => (
              <div key={name} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ paddingRight: theme.spacing(1), flexGrow: 1 }}>
                  <ContainerCard
                    name={name}
                    container={service.dependencies[name].container}
                    defaults={defaults && defaults.dependencies[name] ? defaults.dependencies[name].container : null}
                    volumes={service.dependencies[name].volumes}
                    onChange={handleDependencyChange}
                  />
                </div>
                <div>
                  <Tooltip title={t('container.dependencies.remove')}>
                    <IconButton
                      style={{
                        color: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark
                      }}
                      onClick={() => onDependencyDelete(name)}
                      size="large"
                    >
                      <RemoveCircleOutlineOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                </div>
              </div>
            ))
          ) : (
            <Typography color="textSecondary" variant="caption" component="div">
              {t('container.dependencies.none')}
            </Typography>
          )
        ) : (
          <Skeleton style={{ height: '8rem' }} />
        )}
      </Grid>

      <Grid size={{ xs: 12 }}>
        <ContainerDialog open={dialog} setOpen={setDialog} name="" volumes={{}} onSave={handleDependencyChange} />
        <Button variant="contained" color="primary" onClick={() => setDialog(true)}>
          {t('container.dependencies.add')}
        </Button>
      </Grid>
    </Grid>
  );
};

export default ServiceContainer;
