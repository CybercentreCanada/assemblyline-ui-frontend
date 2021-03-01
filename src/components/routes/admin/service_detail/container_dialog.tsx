import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  Radio,
  RadioGroup,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@material-ui/core';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import RemoveCircleOutlineOutlinedIcon from '@material-ui/icons/RemoveCircleOutlineOutlined';
import 'moment/locale/fr';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Volume } from '../service_detail';

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

const WrappedEnvironment = ({ envVar, onAdd, onUpdate, onDelete }: EnvironmentProps) => {
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
              color: theme.palette.type === 'dark' ? theme.palette.error.light : theme.palette.error.dark
            }}
            onClick={() => onDelete(envVar)}
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
                color: theme.palette.type === 'dark' ? theme.palette.success.light : theme.palette.success.dark
              }}
              onClick={addEnvironment}
            >
              <AddCircleOutlineIcon />
            </IconButton>
          </Tooltip>
        )}
      </Grid>
    </Grid>
  );
};

WrappedEnvironment.defaultProps = {
  envVar: null,
  // eslint-disable-next-line no-console
  onAdd: envVar => console.log('ADD', envVar),
  // eslint-disable-next-line no-console
  onUpdate: envVar => console.log('UPDATE', envVar),
  // eslint-disable-next-line no-console
  onDelete: envVar => console.log('DELETE', envVar)
};

const Environment = React.memo(WrappedEnvironment);

type VolumeControlProps = {
  name?: string;
  vol?: Volume;
  onAdd?: (name: string, vol: Volume) => void;
  onDelete?: (name: string) => void;
};

const DEFAULT_VOL = {
  capacity: '',
  mount_path: '',
  storage_class: ''
};

const WrappedVolumeControl = ({ name, vol, onAdd, onDelete }: VolumeControlProps) => {
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
        {`${vol.mount_path} (${vol.capacity})`}
      </Grid>
      <Grid item xs={2} sm={1}>
        <Tooltip title={t('params.user.remove')}>
          <IconButton
            style={{
              color: theme.palette.type === 'dark' ? theme.palette.error.light : theme.palette.error.dark
            }}
            onClick={() => onDelete(name)}
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
                color: theme.palette.type === 'dark' ? theme.palette.success.light : theme.palette.success.dark
              }}
              onClick={addVolume}
            >
              <AddCircleOutlineIcon />
            </IconButton>
          </Tooltip>
        )}
      </Grid>
    </Grid>
  );
};

WrappedVolumeControl.defaultProps = {
  name: null,
  vol: null,
  // eslint-disable-next-line no-console
  onAdd: (name, vol) => console.log('ADD', name, vol),
  // eslint-disable-next-line no-console
  onDelete: name => console.log('DELETE', name)
};

const VolumeControl = React.memo(WrappedVolumeControl);

const DEFAULT_CONTAINER: Container = {
  allow_internet_access: false,
  command: null,
  cpu_cores: 1,
  environment: [],
  image: '',
  ports: [],
  ram_mb: 512,
  ram_mb_min: 128,
  registry_password: '',
  registry_username: ''
};

type ContainerDialogProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  container?: Container;
  name?: string;
  volumes?: { [name: string]: Volume };
  onSave: (newContainer: Container, name?: string, newVolumes?: { [name: string]: Volume }) => void;
};

const WrappedContainerDialog = ({ open, setOpen, container, name, volumes, onSave }: ContainerDialogProps) => {
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
    setTempContainer({ ...tempContainer, [field]: value });
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
            <Grid item xs={12}>
              <Typography variant="subtitle2">{t('container.dialog.image')}</Typography>
              <TextField
                fullWidth
                size="small"
                margin="dense"
                variant="outlined"
                onChange={event => handleContainerValueChange('image', event.target.value)}
                value={tempContainer.image}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">{t('container.dialog.cpu')}</Typography>
              <TextField
                fullWidth
                type="number"
                size="small"
                margin="dense"
                variant="outlined"
                onChange={event => handleContainerValueChange('cpu_cores', event.target.value)}
                value={tempContainer.cpu_cores}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">{t('container.dialog.ram')}</Typography>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    size="small"
                    margin="dense"
                    variant="outlined"
                    onChange={event => handleContainerValueChange('ram_mb_min', event.target.value)}
                    value={tempContainer.ram_mb_min}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    size="small"
                    margin="dense"
                    variant="outlined"
                    onChange={event => handleContainerValueChange('ram_mb', event.target.value)}
                    value={tempContainer.ram_mb}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">{t('container.dialog.registry_username')}</Typography>
              <TextField
                fullWidth
                size="small"
                margin="dense"
                variant="outlined"
                onChange={event => handleContainerValueChange('registry_username', event.target.value)}
                value={tempContainer.registry_username}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">{t('container.dialog.registry_password')}</Typography>
              <TextField
                fullWidth
                size="small"
                margin="dense"
                variant="outlined"
                onChange={event => handleContainerValueChange('registry_password', event.target.value)}
                value={tempContainer.registry_password}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">{t('container.dialog.command')}</Typography>
              <TextField
                fullWidth
                size="small"
                margin="dense"
                variant="outlined"
                onChange={handleContainerCommandChange}
                value={tempContainer.command}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">{t('container.dialog.allow_internet')}</Typography>
              <RadioGroup value={tempContainer.allow_internet_access} onChange={handleInternetToggle}>
                <FormControlLabel value control={<Radio />} label={t('container.dialog.allow_internet.yes')} />
                <FormControlLabel value={false} control={<Radio />} label={t('container.dialog.allow_internet.no')} />
              </RadioGroup>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">{t('container.dialog.environment')}</Typography>
              {tempContainer.environment.map((env, i) => {
                return <Environment key={i} envVar={env} onUpdate={handleEnvAddUpdate} onDelete={handleEnvDelete} />;
              })}
            </Grid>
            <Grid item xs={12}>
              <Environment onAdd={handleEnvAddUpdate} />
            </Grid>
            {name !== null && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">{t('container.dialog.volumes')}</Typography>
                  {Object.keys(tempVolumes).map(vol_name => {
                    return (
                      <VolumeControl
                        key={vol_name}
                        name={vol_name}
                        vol={tempVolumes[vol_name]}
                        onDelete={handleVolDelete}
                      />
                    );
                  })}
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

WrappedContainerDialog.defaultProps = {
  container: null,
  name: null,
  volumes: null
};

const ContainerDialog = React.memo(WrappedContainerDialog);
export default ContainerDialog;
