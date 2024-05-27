import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import FormControl from '@mui/material/FormControl';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Volume } from '../service_detail';
import ResetButton from './reset_button';

type EnvironmentVar = {
  name: string;
  value: string;
};

type EnvironmentProps = {
  envVar?: EnvironmentVar;
  onAdd?: (envVar: EnvironmentVar) => void;
  onUpdate?: (envVar: EnvironmentVar) => void;
  onDelete?: (envVar: EnvironmentVar) => void;
};

const DEFAULT_ENV = { name: '', value: '' };

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
  const [tempEnvVar, setTempEnvVar] = useState(DEFAULT_ENV);
  const theme = useTheme();

  const handleValueUpdate = event => {
    onUpdate({ ...envVar, value: event.target.value });
  };

  const addEnvironment = () => {
    onAdd(tempEnvVar);
    setTempEnvVar(DEFAULT_ENV);
  };

  const handleNameChange = event => {
    setTempEnvVar({ ...tempEnvVar, name: event.target.value });
  };

  const handleValueChange = event => {
    setTempEnvVar({ ...tempEnvVar, value: event.target.value });
  };

  return envVar ? (
    <Grid container spacing={1} alignItems="center">
      <Grid item xs={10} sm={3} style={{ wordBreak: 'break-word' }}>
        {`${envVar.name} :`}
      </Grid>
      <Grid item xs={10} sm={8}>
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
      <Grid item xs={2} sm={1}>
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
      <Grid item xs={10} sm={3}>
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
      <Grid item xs={10} sm={8}>
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
      <Grid item xs={2} sm={1} style={{ height: theme.spacing(8) }}>
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
  vol?: Volume;
  onAdd?: (name: string, vol: Volume) => void;
  onDelete?: (name: string) => void;
};

const DEFAULT_VOL: Volume = {
  capacity: '',
  mount_path: '',
  storage_class: '',
  access_mode: 'ReadWriteOnce'
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
  const [tempVol, setTempVol] = useState(DEFAULT_VOL);
  const [tempName, setTempName] = useState('');
  const theme = useTheme();

  const addVolume = () => {
    onAdd(tempName, tempVol);
    setTempVol(DEFAULT_VOL);
    setTempName('');
  };

  const handleNameChange = event => {
    setTempName(event.target.value);
  };

  const handleValueChange = (field, value) => {
    setTempVol({ ...tempVol, [field]: value });
  };

  return name && vol ? (
    <Grid container spacing={1} alignItems="center">
      <Grid item xs={10} sm={3} style={{ wordBreak: 'break-word' }}>
        {`${name} :`}
      </Grid>
      <Grid item xs={10} sm={8}>
        {`${vol.mount_path} (${vol.storage_class} | ${vol.access_mode} | ${vol.capacity}B)`}
      </Grid>
      <Grid item xs={2} sm={1}>
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
      <Grid item xs={10} sm={3}>
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
      <Grid item xs={10} sm={8}>
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
      <Grid item xs={2} sm={1} style={{ height: theme.spacing(8) }}>
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

const DEFAULT_CONTAINER: Container = {
  allow_internet_access: false,
  command: null,
  cpu_cores: 1,
  environment: [],
  labels: [],
  image: '',
  ports: [],
  ram_mb: 512,
  ram_mb_min: 128,
  registry_password: '',
  registry_username: '',
  registry_type: 'docker',
  service_account: ''
};

type ContainerDialogProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  container?: Container;
  defaults?: Container;
  name?: string;
  volumes?: { [name: string]: Volume };
  onSave: (newContainer: Container, name?: string, newVolumes?: { [name: string]: Volume }) => void;
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
  const [modified, setModified] = useState(false);
  const [tempContainer, setTempContainer] = useState(container || DEFAULT_CONTAINER);
  const [tempName, setTempName] = useState(name);
  const [tempVolumes, setTempVolumes] = useState(volumes);
  const theme = useTheme();

  const handleSave = () => {
    setModified(false);
    setOpen(false);
    onSave(tempContainer, tempName, tempVolumes);
  };

  const handleClose = () => {
    setOpen(false);
    setModified(false);
    setTempContainer(container || DEFAULT_CONTAINER);
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
      let clone = { ...tempContainer };
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
              <Grid item xs={12}>
                <Typography variant="subtitle2">{t('container.dialog.name')}</Typography>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  variant="outlined"
                  onChange={event => setTempName(event.target.value)}
                  value={tempName}
                />
              </Grid>
            )}
            <Grid item xs={8}>
              <Typography variant="subtitle2">
                {t('container.dialog.image')}
                <ResetButton
                  service={tempContainer}
                  defaults={defaults}
                  field="image"
                  reset={() => {
                    setModified(true);
                    setTempContainer({ ...tempContainer, image: defaults.image });
                  }}
                />
              </Typography>
              <TextField
                fullWidth
                size="small"
                margin="dense"
                variant="outlined"
                onChange={event => handleContainerValueChange('image', event.target.value)}
                value={tempContainer.image}
              />
            </Grid>
            <Grid item xs={4}>
              <Typography variant="subtitle2">
                {t('container.dialog.registry_type')}
                <ResetButton
                  service={tempContainer}
                  defaults={defaults}
                  field="registry_type"
                  reset={() => {
                    setModified(true);
                    setTempContainer({ ...tempContainer, registry_type: defaults.registry_type });
                  }}
                />
              </Typography>
              <FormControl size="small" fullWidth>
                <Select
                  fullWidth
                  id="registry_type"
                  variant="outlined"
                  value={tempContainer.registry_type}
                  style={{ marginTop: theme.spacing(1), marginBottom: theme.spacing(0.5) }}
                  onChange={event => handleContainerValueChange('registry_type', event.target.value)}
                >
                  <MenuItem value="docker">{t('Docker')}</MenuItem>
                  <MenuItem value="harbor">{t('Harbor')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">
                {t('container.dialog.cpu')}
                <ResetButton
                  service={tempContainer}
                  defaults={defaults}
                  field="cpu_cores"
                  reset={() => {
                    setModified(true);
                    setTempContainer({ ...tempContainer, cpu_cores: defaults.cpu_cores });
                  }}
                />
              </Typography>
              <TextField
                fullWidth
                type="number"
                margin="dense"
                size="small"
                variant="outlined"
                onChange={event => handleContainerValueChange('cpu_cores', event.target.value)}
                value={tempContainer.cpu_cores}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">
                {t('container.dialog.ram')}
                <ResetButton
                  service={tempContainer}
                  defaults={defaults}
                  field={['ram_mb_min', 'ram_mb']}
                  reset={() => {
                    setModified(true);
                    setTempContainer({ ...tempContainer, ram_mb_min: defaults.ram_mb_min, ram_mb: defaults.ram_mb });
                  }}
                />
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    margin="dense"
                    size="small"
                    variant="outlined"
                    onChange={event => handleContainerValueChange('ram_mb_min', event.target.value)}
                    value={tempContainer.ram_mb_min}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    margin="dense"
                    size="small"
                    variant="outlined"
                    onChange={event => handleContainerValueChange('ram_mb', event.target.value)}
                    value={tempContainer.ram_mb}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">
                {t('container.dialog.registry_username')}
                <ResetButton
                  service={tempContainer}
                  defaults={defaults}
                  field="registry_username"
                  reset={() => {
                    setModified(true);
                    setTempContainer({ ...tempContainer, registry_username: defaults.registry_username || '' });
                  }}
                />
              </Typography>
              <TextField
                fullWidth
                size="small"
                margin="dense"
                variant="outlined"
                onChange={event => handleContainerValueChange('registry_username', event.target.value || undefined)}
                value={tempContainer.registry_username ? tempContainer.registry_username : ''}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">
                {t('container.dialog.registry_password')}
                <ResetButton
                  service={tempContainer}
                  defaults={defaults}
                  field="registry_password"
                  reset={() => {
                    setModified(true);
                    setTempContainer({ ...tempContainer, registry_password: defaults.registry_password || '' });
                  }}
                />
              </Typography>
              <TextField
                fullWidth
                size="small"
                margin="dense"
                variant="outlined"
                onChange={event => handleContainerValueChange('registry_password', event.target.value || undefined)}
                value={tempContainer.registry_password ? tempContainer.registry_password : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">
                {t('container.dialog.service_account')}
                <ResetButton
                  service={tempContainer}
                  defaults={defaults}
                  field="service_account"
                  reset={() => {
                    setModified(true);
                    setTempContainer({ ...tempContainer, service_account: defaults.service_account });
                  }}
                />
              </Typography>
              <TextField
                fullWidth
                size="small"
                margin="dense"
                variant="outlined"
                onChange={event => handleContainerValueChange('service_account', event.target.value || undefined)}
                value={tempContainer.service_account ? tempContainer.service_account : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">
                {t('container.dialog.command')}
                <ResetButton
                  service={tempContainer}
                  defaults={defaults}
                  field="command"
                  reset={() => {
                    setModified(true);
                    setTempContainer({ ...tempContainer, command: defaults.command });
                  }}
                />
              </Typography>
              <TextField
                fullWidth
                size="small"
                margin="dense"
                variant="outlined"
                onChange={handleContainerCommandChange}
                value={tempContainer.command ? tempContainer.command.join(' ') : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">
                {t('container.dialog.allow_internet')}
                <ResetButton
                  service={tempContainer}
                  defaults={defaults}
                  field="allow_internet_access"
                  reset={() => {
                    setModified(true);
                    setTempContainer({ ...tempContainer, allow_internet_access: defaults.allow_internet_access });
                  }}
                />
              </Typography>
              <RadioGroup value={tempContainer.allow_internet_access} onChange={handleInternetToggle}>
                <FormControlLabel value control={<Radio />} label={t('container.dialog.allow_internet.yes')} />
                <FormControlLabel value={false} control={<Radio />} label={t('container.dialog.allow_internet.no')} />
              </RadioGroup>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">{t('container.dialog.environment')}</Typography>
              {tempContainer.environment.map((env, i) => (
                <Environment key={i} envVar={env} onUpdate={handleEnvAddUpdate} onDelete={handleEnvDelete} />
              ))}
            </Grid>
            <Grid item xs={12}>
              <Environment onAdd={handleEnvAddUpdate} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">{t('container.dialog.labels')}</Typography>
              {(tempContainer.labels || []).map((env, i) => (
                <Environment key={i} envVar={env} onUpdate={handleLabelAddUpdate} onDelete={handleLabelDelete} />
              ))}
            </Grid>
            <Grid item xs={12}>
              <Environment onAdd={handleLabelAddUpdate} />
            </Grid>
            {name !== null && (
              <>
                <Grid item xs={12}>
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

                <Grid item xs={12}>
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
