import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  useTheme
} from '@material-ui/core';
import 'moment/locale/fr';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Volume } from '../service_detail';

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
              <Typography variant="subtitle2">{t('container.dialog.allow_internet')}</Typography>
              <RadioGroup value={tempContainer.allow_internet_access} onChange={handleInternetToggle}>
                <FormControlLabel value control={<Radio />} label={t('container.dialog.allow_internet.yes')} />
                <FormControlLabel value={false} control={<Radio />} label={t('container.dialog.allow_internet.no')} />
              </RadioGroup>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">{t('container.dialog.environment')}</Typography>
              {JSON.stringify(tempContainer.environment)}
            </Grid>
            {name !== null && (
              <Grid item xs={12}>
                <Typography variant="subtitle2">{t('container.dialog.volumes')}</Typography>
                {JSON.stringify(tempVolumes)}
              </Grid>
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
