import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import FormControl from '@mui/material/FormControl';
import type { DockerConfig, EnvironmentVariable, PersistentVolume } from 'components/models/base/service';
import {
  DEFAULT_DOCKER_CONFIG,
  DEFAULT_ENVIRONMENT_VARIABLE,
  DEFAULT_PERSISTENT_VOLUME
} from 'components/models/base/service';
import { showReset } from 'components/routes/admin/service_detail/service.utils';
import { NumberInput } from 'components/visual/Inputs/NumberInput';
import { RadioInput } from 'components/visual/Inputs/RadioInput';
import { SelectInput } from 'components/visual/Inputs/SelectInput';
import { TextInput } from 'components/visual/Inputs/TextInput';
import type { Dispatch, SetStateAction } from 'react';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

type EnvironmentProps = {
  envVar?: EnvironmentVariable;
  onAdd?: Dispatch<SetStateAction<EnvironmentVariable>>;
  onUpdate?: Dispatch<SetStateAction<EnvironmentVariable>>;
  onDelete?: Dispatch<SetStateAction<EnvironmentVariable>>;
};

const WrappedEnvironment = ({
  envVar = null,
  // eslint-disable-next-line no-console
  onAdd = value => console.log('ADD', value),
  // eslint-disable-next-line no-console
  onUpdate = value => console.log('UPDATE', value),
  // eslint-disable-next-line no-console
  onDelete = value => console.log('DELETE', value)
}: EnvironmentProps) => {
  const { t } = useTranslation(['adminServices']);
  const theme = useTheme();

  const [tempEnvVar, setTempEnvVar] = useState<EnvironmentVariable>(DEFAULT_ENVIRONMENT_VARIABLE);

  const handleValueUpdate = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onUpdate({ ...envVar, value: event.target.value }),
    [envVar, onUpdate]
  );

  const addEnvironment = useCallback(() => {
    onAdd(tempEnvVar);
    setTempEnvVar(DEFAULT_ENVIRONMENT_VARIABLE);
  }, [onAdd, tempEnvVar]);

  const handleNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setTempEnvVar({ ...tempEnvVar, name: event.target.value });
    },
    [tempEnvVar]
  );

  const handleValueChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setTempEnvVar({ ...tempEnvVar, value: event.target.value });
    },
    [tempEnvVar]
  );

  return envVar ? (
    <Grid container spacing={1} alignItems="center">
      <Grid size={{ xs: 10, sm: 3 }} style={{ wordBreak: 'break-word' }}>
        {`${envVar.name} :`}
      </Grid>
      <Grid size={{ xs: 10, sm: 8 }}>
        <TextField
          fullWidth
          size="small"
          margin="dense"
          variant="outlined"
          value={envVar.value}
          onChange={handleValueUpdate}
          style={{ margin: 0 }}
        />
      </Grid>
      <Grid size={{ xs: 2, sm: 1 }}>
        <Tooltip title={t('params.user.remove')}>
          <IconButton
            style={{
              color: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark
            }}
            onClick={() => onDelete(envVar)}
            size="large"
          >
            <RemoveCircleOutlineOutlinedIcon />
          </IconButton>
        </Tooltip>
      </Grid>
    </Grid>
  ) : (
    <Grid container spacing={1} alignItems="center">
      <Grid size={{ xs: 10, sm: 3 }}>
        <TextField
          fullWidth
          placeholder={t('container.dialog.environment.name')}
          size="small"
          margin="dense"
          variant="outlined"
          onChange={handleNameChange}
          value={tempEnvVar.name}
          style={{ margin: 0 }}
        />
      </Grid>
      <Grid size={{ xs: 10, sm: 8 }}>
        <TextField
          fullWidth
          placeholder={t('container.dialog.environment.value')}
          size="small"
          margin="dense"
          variant="outlined"
          value={tempEnvVar.value}
          onChange={handleValueChange}
          style={{ margin: 0 }}
        />
      </Grid>
      <Grid size={{ xs: 2, sm: 1 }}>
        {tempEnvVar.name !== '' && tempEnvVar.value !== '' && (
          <Tooltip title={t('params.user.add')}>
            <IconButton
              style={{
                color: theme.palette.mode === 'dark' ? theme.palette.success.light : theme.palette.success.dark
              }}
              onClick={addEnvironment}
              size="large"
            >
              <AddCircleOutlineIcon />
            </IconButton>
          </Tooltip>
        )}
      </Grid>
    </Grid>
  );
};

const Environment = React.memo(WrappedEnvironment);

type VolumeControlProps = {
  name?: string;
  vol?: PersistentVolume;
  onAdd?: (name: string, vol: PersistentVolume) => void;
  onDelete?: (name: string) => void;
};

const WrappedVolumeControl = ({
  name = null,
  vol = null,
  // eslint-disable-next-line no-console
  onAdd = (n, v) => console.log('ADD', n, v),
  // eslint-disable-next-line no-console
  onDelete = n => console.log('DELETE', n)
}: VolumeControlProps) => {
  const { t } = useTranslation(['adminServices']);
  const theme = useTheme();

  const [tempVol, setTempVol] = useState<PersistentVolume>(DEFAULT_PERSISTENT_VOLUME);
  const [tempName, setTempName] = useState<string>('');

  const addVolume = useCallback(() => {
    onAdd(tempName, tempVol);
    setTempVol(DEFAULT_PERSISTENT_VOLUME);
    setTempName('');
  }, [onAdd, tempName, tempVol]);

  const handleNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setTempName(event.target.value),
    []
  );

  const handleValueChange = useCallback((field, value) => setTempVol({ ...tempVol, [field]: value }), [tempVol]);

  return name && vol ? (
    <Grid container spacing={1} alignItems="center">
      <Grid size={{ xs: 10, sm: 3 }} style={{ wordBreak: 'break-word' }}>
        {`${name} :`}
      </Grid>
      <Grid size={{ xs: 10, sm: 8 }}>
        {`${vol.mount_path} (${vol.storage_class} | ${vol.access_mode} | ${vol.capacity}B)`}
      </Grid>
      <Grid size={{ xs: 2, sm: 1 }}>
        <Tooltip title={t('params.user.remove')}>
          <IconButton
            style={{
              color: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark
            }}
            onClick={() => onDelete(name)}
            size="large"
          >
            <RemoveCircleOutlineOutlinedIcon />
          </IconButton>
        </Tooltip>
      </Grid>
    </Grid>
  ) : (
    <Grid container spacing={1}>
      <Grid size={{ xs: 10, sm: 3 }}>
        <TextField
          fullWidth
          placeholder={t('container.dialog.volumes.name')}
          size="small"
          margin="dense"
          variant="outlined"
          onChange={handleNameChange}
          value={tempName}
          style={{ margin: 0 }}
        />
      </Grid>
      <Grid size={{ xs: 10, sm: 8 }}>
        <FormControl size="small" fullWidth>
          <Select
            fullWidth
            label={t('container.dialog.volumes.access_mode')}
            id="access_mode"
            variant="outlined"
            value={tempVol.access_mode}
            style={{ margin: 0 }}
            onChange={event => handleValueChange('access_mode', event.target.value)}
          >
            <MenuItem value="ReadWriteOnce">{t('ReadWriteOnce')}</MenuItem>
            <MenuItem value="ReadWriteMany">{t('ReadWriteMany')}</MenuItem>
          </Select>
        </FormControl>
        <TextField
          fullWidth
          placeholder={t('container.dialog.volumes.mount_path')}
          size="small"
          margin="dense"
          variant="outlined"
          value={tempVol.mount_path}
          onChange={event => handleValueChange('mount_path', event.target.value)}
          style={{ margin: 0 }}
        />
        <TextField
          fullWidth
          placeholder={t('container.dialog.volumes.capacity')}
          size="small"
          margin="dense"
          variant="outlined"
          value={tempVol.capacity}
          onChange={event => handleValueChange('capacity', event.target.value)}
          style={{ margin: 0 }}
        />
        <TextField
          fullWidth
          placeholder={t('container.dialog.volumes.storage_class')}
          size="small"
          margin="dense"
          variant="outlined"
          value={tempVol.storage_class}
          onChange={event => handleValueChange('storage_class', event.target.value)}
          style={{ margin: 0 }}
        />
      </Grid>
      <Grid size={{ xs: 2, sm: 1 }}>
        {tempName !== '' && tempVol.capacity !== '' && tempVol.mount_path !== '' && tempVol.storage_class !== '' && (
          <Tooltip title={t('params.user.add')}>
            <IconButton
              style={{
                color: theme.palette.mode === 'dark' ? theme.palette.success.light : theme.palette.success.dark
              }}
              onClick={addVolume}
              size="large"
            >
              <AddCircleOutlineIcon />
            </IconButton>
          </Tooltip>
        )}
      </Grid>
    </Grid>
  );
};

const VolumeControl = React.memo(WrappedVolumeControl);

type ContainerDialogProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  container?: DockerConfig;
  defaults?: DockerConfig;
  name?: string;
  volumes?: Record<string, PersistentVolume>;
  onSave: (newContainer: DockerConfig, name?: string, newVolumes?: Record<string, PersistentVolume>) => void;
};

const WrappedContainerDialog = ({
  open,
  setOpen,
  container = null,
  defaults,
  name = null,
  volumes = null,
  onSave
}: ContainerDialogProps) => {
  const { t } = useTranslation(['adminServices']);
  const theme = useTheme();

  const [tempContainer, setTempContainer] = useState<DockerConfig>(container || DEFAULT_DOCKER_CONFIG);
  const [tempName, setTempName] = useState<string>(name);
  const [tempVolumes, setTempVolumes] = useState<Record<string, PersistentVolume>>(volumes);
  const [modified, setModified] = useState<boolean>(true);

  const handleSave = () => {
    setModified(false);
    setOpen(false);
    onSave(tempContainer, tempName, tempVolumes);
  };

  const handleClose = () => {
    setOpen(false);
    setModified(false);
    setTempContainer(container || DEFAULT_DOCKER_CONFIG);
    setTempName(name);
    setTempVolumes(volumes);
  };

  const handleInternetToggle = () => {
    setModified(true);
    setTempContainer({ ...tempContainer, allow_internet_access: !tempContainer.allow_internet_access });
  };

  const handleContainerValueChange = (field, value) => {
    setModified(true);
    if (value === undefined) {
      const clone = { ...tempContainer };
      delete clone[field];
      setTempContainer(clone);
    } else {
      setTempContainer({ ...tempContainer, [field]: value });
    }
  };

  const handleContainerCommandChange = event => {
    setModified(true);
    setTempContainer({ ...tempContainer, command: event.target.value.split(' ') });
  };

  const handleEnvAddUpdate = newEnv => {
    const newEnvironment = [...tempContainer.environment];
    let index = -1;
    newEnvironment.forEach((element, i) => {
      if (element.name === newEnv.name) {
        index = i;
      }
    });

    if (index === -1) {
      newEnvironment.push(newEnv);
    } else {
      newEnvironment[index] = newEnv;
    }

    setModified(true);
    setTempContainer({ ...tempContainer, environment: newEnvironment });
  };

  const handleLabelAddUpdate = newLabel => {
    const newLabels = [...(tempContainer.labels || [])];
    let index = -1;
    newLabels.forEach((element, i) => {
      if (element.name === newLabel.name) {
        index = i;
      }
    });

    if (index === -1) {
      newLabels.push(newLabel);
    } else {
      newLabels[index] = newLabel;
    }

    setModified(true);
    setTempContainer({ ...tempContainer, labels: newLabels });
  };

  const handleEnvDelete = delEnv => {
    const newEnvironment = [...tempContainer.environment];
    let index = -1;
    newEnvironment.forEach((element, i) => {
      if (element.name === delEnv.name) {
        index = i;
      }
    });
    if (index !== -1) {
      newEnvironment.splice(index, 1);
      setModified(true);
      setTempContainer({ ...tempContainer, environment: newEnvironment });
    }
  };

  const handleLabelDelete = delLabel => {
    const newLabels = [...tempContainer.labels];
    let index = -1;
    newLabels.forEach((element, i) => {
      if (element.name === delLabel.name) {
        index = i;
      }
    });
    if (index !== -1) {
      newLabels.splice(index, 1);
      setModified(true);
      setTempContainer({ ...tempContainer, labels: newLabels });
    }
  };

  const handleVolAdd = (vol_name, vol) => {
    setModified(true);
    setTempVolumes({ ...tempVolumes, [vol_name]: vol });
  };
  const handleVolDelete = vol_name => {
    const newVolumes = { ...tempVolumes };
    delete newVolumes[vol_name];

    setModified(true);
    setTempVolumes(newVolumes);
  };

  return (
    <div style={{ paddingTop: theme.spacing(1) }}>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title" fullWidth maxWidth="md">
        <DialogTitle id="form-dialog-title">
          {t(`container.dialog.title.${name === null ? 'container' : 'dependency'}`)}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {name !== null && (
              <Grid size={{ xs: 12 }}>
                <TextInput label={t('container.dialog.name')} value={tempName} onChange={(e, v) => setTempName(v)} />
              </Grid>
            )}

            <Grid size={{ xs: 8 }}>
              <TextInput
                label={t('container.dialog.image')}
                loading={!tempContainer}
                value={!tempContainer ? null : tempContainer.image}
                reset={showReset(tempContainer, defaults, 'image')}
                onChange={(e, v) => handleContainerValueChange('image', v)}
                onReset={() => {
                  setModified(true);
                  setTempContainer({ ...tempContainer, image: defaults.image });
                }}
              />
            </Grid>

            <Grid size={{ xs: 4 }}>
              <SelectInput
                label={t('container.dialog.registry_type')}
                loading={!tempContainer}
                value={!tempContainer ? null : tempContainer.registry_type}
                reset={showReset(tempContainer, defaults, 'registry_type')}
                options={[
                  { value: 'docker', primary: t('Docker') },
                  { value: 'harbor', primary: t('Harbor') }
                ]}
                onChange={(e, v: string) => handleContainerValueChange('registry_type', v)}
                onReset={() => {
                  setModified(true);
                  setTempContainer({ ...tempContainer, registry_type: defaults.registry_type });
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <NumberInput
                label={t('container.dialog.cpu')}
                loading={!tempContainer}
                value={!tempContainer ? null : tempContainer.cpu_cores}
                reset={showReset(tempContainer, defaults, 'cpu_cores')}
                onChange={(e, v) => handleContainerValueChange('cpu_cores', v)}
                onReset={() => {
                  setModified(true);
                  setTempContainer({ ...tempContainer, cpu_cores: defaults.cpu_cores });
                }}
              />
            </Grid>

            <Grid size={{ xs: 6, md: 3 }}>
              <NumberInput
                label={t('container.dialog.ram')}
                loading={!tempContainer}
                value={!tempContainer ? null : tempContainer.ram_mb_min}
                reset={showReset(tempContainer, defaults, 'ram_mb_min')}
                endAdornment="MB"
                onChange={(e, v) => handleContainerValueChange('ram_mb_min', v)}
                onReset={() => {
                  setModified(true);
                  setTempContainer({ ...tempContainer, ram_mb_min: defaults.ram_mb_min, ram_mb: defaults.ram_mb });
                }}
              />
            </Grid>

            <Grid size={{ xs: 6, md: 3 }}>
              <NumberInput
                label={'\u00A0'}
                loading={!tempContainer}
                value={!tempContainer ? null : tempContainer.ram_mb}
                reset={showReset(tempContainer, defaults, 'ram_mb')}
                endAdornment="MB"
                onChange={(e, v) => handleContainerValueChange('ram_mb', v)}
                onReset={() => {
                  setModified(true);
                  setTempContainer({ ...tempContainer, ram_mb_min: defaults.ram_mb_min, ram_mb: defaults.ram_mb });
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextInput
                label={t('container.dialog.registry_username')}
                loading={!tempContainer}
                value={!tempContainer ? null : tempContainer.registry_username ? tempContainer.registry_username : ''}
                reset={showReset(tempContainer, defaults, 'registry_username')}
                onChange={(e, v) => handleContainerValueChange('registry_username', v || undefined)}
                onReset={() => {
                  setModified(true);
                  setTempContainer({ ...tempContainer, registry_username: defaults.registry_username || '' });
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextInput
                label={t('container.dialog.registry_password')}
                loading={!tempContainer}
                value={(!tempContainer ? null : (tempContainer.registry_password ?? '')) as string}
                reset={showReset(tempContainer, defaults, 'registry_password')}
                onChange={(e, v) => handleContainerValueChange('registry_password', v || undefined)}
                onReset={() => {
                  setModified(true);
                  setTempContainer({ ...tempContainer, registry_password: defaults.registry_password || '' });
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextInput
                label={t('container.dialog.service_account')}
                loading={!tempContainer}
                value={!tempContainer ? null : tempContainer.service_account ? tempContainer.service_account : ''}
                reset={showReset(tempContainer, defaults, 'service_account')}
                onChange={(e, v) => handleContainerValueChange('service_account', v || undefined)}
                onReset={() => {
                  setModified(true);
                  setTempContainer({ ...tempContainer, service_account: defaults.service_account });
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextInput
                label={t('container.dialog.command')}
                loading={!tempContainer}
                value={!tempContainer ? null : tempContainer.command ? tempContainer.command.join(' ') : ''}
                reset={showReset(tempContainer, defaults, 'command')}
                onChange={(e, v) => handleContainerCommandChange(e)}
                onReset={() => {
                  setModified(true);
                  setTempContainer({ ...tempContainer, command: defaults.command });
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <RadioInput
                label={t('container.dialog.allow_internet')}
                loading={!tempContainer}
                value={!tempContainer ? null : tempContainer.allow_internet_access}
                reset={showReset(tempContainer, defaults, 'allow_internet_access')}
                options={[
                  { value: true, label: t('container.dialog.allow_internet.yes') },
                  { value: false, label: t('container.dialog.allow_internet.no') }
                ]}
                onChange={(e, v) => {
                  setModified(true);
                  setTempContainer({ ...tempContainer, allow_internet_access: v });
                }}
                onReset={() => {
                  setModified(true);
                  setTempContainer({ ...tempContainer, allow_internet_access: defaults.allow_internet_access });
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography color="textSecondary" variant="subtitle2">
                {t('container.dialog.environment')}
              </Typography>
              {tempContainer.environment.map((env, i) => (
                <Environment key={i} envVar={env} onUpdate={handleEnvAddUpdate} onDelete={handleEnvDelete} />
              ))}
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Environment onAdd={handleEnvAddUpdate} />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography color="textSecondary" variant="subtitle2">
                {t('container.dialog.labels')}
              </Typography>
              {(tempContainer.labels || []).map((env, i) => (
                <Environment key={i} envVar={env} onUpdate={handleLabelAddUpdate} onDelete={handleLabelDelete} />
              ))}
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Environment onAdd={handleLabelAddUpdate} />
            </Grid>

            {name !== null && (
              <>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2">{t('container.dialog.volumes')}</Typography>
                  {Object.keys(tempVolumes).map(vol_name => (
                    <VolumeControl
                      key={vol_name}
                      name={vol_name}
                      vol={tempVolumes[vol_name]}
                      onDelete={handleVolDelete}
                    />
                  ))}
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <VolumeControl onAdd={handleVolAdd} />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            {t('container.dialog.cancelText')}
          </Button>
          <Button onClick={handleSave} color="primary" disabled={!modified || tempContainer.image === ''}>
            {t('container.dialog.acceptText')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

const ContainerDialog = React.memo(WrappedContainerDialog);
export default ContainerDialog;
