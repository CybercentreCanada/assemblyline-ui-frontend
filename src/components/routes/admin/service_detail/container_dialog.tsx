import { Button, Dialog, DialogActions, DialogContent, DialogTitle, useTheme } from '@material-ui/core';
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
  const theme = useTheme();

  const handleSave = () => {
    onSave(container, name, volumes);
  };

  return (
    <div style={{ paddingTop: theme.spacing(1) }}>
      <Dialog open={open} onClose={() => setOpen(false)} aria-labelledby="form-dialog-title" fullWidth maxWidth="md">
        <DialogTitle id="form-dialog-title">
          {t(`container.dialog.title.${name === null ? 'container' : 'dependency'}`)}
        </DialogTitle>
        <DialogContent>
          <div>{name}</div>
          <div>{JSON.stringify(container)}</div>
          <div>{JSON.stringify(volumes)}</div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="secondary">
            {t('container.dialog.cancelText')}
          </Button>
          <Button onClick={handleSave} color="primary" disabled={!modified || container.image === ''}>
            {t('container.dialog.acceptText')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

WrappedContainerDialog.defaultProps = {
  container: DEFAULT_CONTAINER,
  name: null,
  volumes: null
};

const ContainerDialog = React.memo(WrappedContainerDialog);
export default ContainerDialog;
