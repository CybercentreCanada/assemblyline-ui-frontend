import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import { Button, Grid, IconButton, Skeleton, Tooltip, Typography, useTheme } from '@mui/material';
import type { DockerConfig, PersistentVolume, Service } from 'components/models/base/service';
import ContainerCard from 'components/routes/admin/service_detail/container_card';
import ContainerDialog from 'components/routes/admin/service_detail/container_dialog';
import { RadioInput } from 'components/visual/Inputs/RadioInput';
import { SelectInput } from 'components/visual/Inputs/SelectInput';
import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

type ServiceContainerProps = {
  service: Service;
  defaults: Service;
  setService: Dispatch<SetStateAction<Service>>;
  setModified: Dispatch<SetStateAction<boolean>>;
};

const ServiceContainer = ({ service, defaults, setService, setModified }: ServiceContainerProps) => {
  const { t } = useTranslation(['adminServices']);
  const theme = useTheme();

  const [dialog, setDialog] = useState<boolean>(false);

  const onDependencyDelete = useCallback(
    (name: keyof Service['dependencies']) => {
      setModified(true);
      setService(s => {
        const depList = { ...s.dependencies };
        delete depList[name];
        return { ...s, dependencies: depList };
      });
    },
    [setModified, setService]
  );

  const handleContainerImageChange = useCallback(
    (newContainer: DockerConfig) => {
      setModified(true);
      setService(s => ({ ...s, docker_config: newContainer }));
    },
    [setModified, setService]
  );

  const handleDependencyChange = useCallback(
    (newDep: DockerConfig, name: keyof Service['dependencies'], newVolumes: Record<string, PersistentVolume>) => {
      setModified(true);
      setService(s => {
        const depList = { ...s.dependencies };
        depList[name] = { container: newDep, volumes: newVolumes };
        return { ...s, dependencies: depList };
      });
    },
    [setModified, setService]
  );

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
          defaultValue={!defaults ? undefined : defaults?.update_channel}
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
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <RadioInput
          label={t('container.privileged')}
          loading={!service}
          value={!service ? null : service.privileged}
          defaultValue={!defaults ? undefined : defaults?.privileged}
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
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Typography color="textSecondary" variant="subtitle2">
          {t('container.image')}
        </Typography>
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
        <Typography color="textSecondary" variant="subtitle2">
          {t('container.dependencies')}
        </Typography>
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
            <Typography color="textPrimary" variant="caption" component="div">
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
