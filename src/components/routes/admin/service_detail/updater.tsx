import {
  Button,
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
} from '@material-ui/core';
import RemoveCircleOutlineOutlinedIcon from '@material-ui/icons/RemoveCircleOutlineOutlined';
import { Skeleton } from '@material-ui/lab';
import { SourceCard } from 'components/routes/manage/signature_sources';
import 'moment/locale/fr';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ServiceDetail } from '../service_detail';
import ContainerCard from './container_card';
import SourceDialog from './source_dialog';

type ServiceUpdaterProps = {
  service: ServiceDetail;
  setService: (value: ServiceDetail) => void;
  setModified: (value: boolean) => void;
};

const ServiceUpdater = ({ service, setService, setModified }: ServiceUpdaterProps) => {
  const { t } = useTranslation(['adminServices']);
  const [dialog, setDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [editedSourceID, setEditedSourceID] = useState(-1);
  const theme = useTheme();

  const handleMethodChange = event => {
    setModified(true);
    setService({ ...service, update_config: { ...service.update_config, method: event.target.value } });
  };

  const handleUpdateContainerChange = newContainer => {
    setModified(true);
    setService({ ...service, update_config: { ...service.update_config, run_options: newContainer } });
  };

  const toggleSignatures = () => {
    setModified(true);
    setService({
      ...service,
      update_config: { ...service.update_config, generates_signatures: !service.update_config.generates_signatures }
    });
  };

  const toggleWaitForUpdate = () => {
    setModified(true);
    setService({
      ...service,
      update_config: { ...service.update_config, wait_for_update: !service.update_config.wait_for_update }
    });
  };

  const handleIntervalChange = event => {
    setModified(true);
    setService({
      ...service,
      update_config: { ...service.update_config, update_interval_seconds: event.target.value }
    });
  };

  const handleDeleteSource = source_id => {
    const newSources = service.update_config.sources;
    newSources.splice(source_id, 1);
    setModified(true);
    setService({
      ...service,
      update_config: { ...service.update_config, sources: newSources }
    });
  };

  const handleEditSource = source_id => {
    setEditDialog(true);
    setEditedSourceID(source_id);
  };

  const handleSaveSource = newSource => {
    const newSources = [...service.update_config.sources];

    if (editedSourceID === -1) {
      newSources.push(newSource);
    } else {
      newSources[editedSourceID] = newSource;
    }

    setModified(true);
    setService({
      ...service,
      update_config: { ...service.update_config, sources: newSources }
    });
  };

  useEffect(() => {
    if (!editDialog && editedSourceID !== -1) {
      setEditedSourceID(-1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editDialog]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h6">{t('updater')}</Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Typography variant="subtitle2">{t('updater.method')}</Typography>
        {service ? (
          <Select
            id="channel"
            fullWidth
            value={service.update_config.method}
            onChange={handleMethodChange}
            variant="outlined"
            margin="dense"
            style={{ marginTop: theme.spacing(1), marginBottom: theme.spacing(0.5) }}
          >
            <MenuItem value="run">{t('updater.method.run')}</MenuItem>
            {/* <MenuItem value="build">{t('updater.method.build')}</MenuItem> */}
          </Select>
        ) : (
          <Skeleton style={{ height: '2.5rem' }} />
        )}
      </Grid>
      <Grid item xs={12} sm={6}>
        <Typography variant="subtitle2">{t('updater.interval')}</Typography>
        {service ? (
          <TextField
            fullWidth
            type="number"
            size="small"
            margin="dense"
            variant="outlined"
            value={service.update_config.update_interval_seconds}
            onChange={handleIntervalChange}
          />
        ) : (
          <Skeleton style={{ height: '2.5rem' }} />
        )}
      </Grid>
      <Grid item xs={12}>
        <Typography variant="subtitle2">{t('updater.run.options')}</Typography>
        {service ? (
          service.update_config.method === 'run' && (
            <ContainerCard container={service.update_config.run_options} onChange={handleUpdateContainerChange} />
          )
        ) : (
          <Skeleton style={{ height: '8rem' }} />
        )}
      </Grid>
      <Grid item xs={12} sm={6}>
        <Typography variant="subtitle2">{t('updater.signatures')}</Typography>
        <RadioGroup value={service.update_config.generates_signatures} onChange={toggleSignatures}>
          <FormControlLabel value control={<Radio />} label={t('updater.signatures.yes')} />
          <FormControlLabel value={false} control={<Radio />} label={t('updater.signatures.no')} />
        </RadioGroup>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Typography variant="subtitle2">{t('updater.wait')}</Typography>
        <RadioGroup value={service.update_config.wait_for_update} onChange={toggleWaitForUpdate}>
          <FormControlLabel value control={<Radio />} label={t('updater.wait.yes')} />
          <FormControlLabel value={false} control={<Radio />} label={t('updater.wait.no')} />
        </RadioGroup>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle2">{t('updater.sources')}</Typography>
        <SourceDialog
          open={editDialog}
          source={editedSourceID !== -1 ? service.update_config.sources[editedSourceID] : null}
          setOpen={setEditDialog}
          onSave={handleSaveSource}
        />
        {service.update_config.sources.length !== 0 ? (
          service.update_config.sources.map((source, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ paddingRight: theme.spacing(1), flexGrow: 1 }}>
                <SourceCard key={i} source={source} onClick={() => handleEditSource(i)} />
              </div>
              <div>
                <Tooltip title={t('updater.sources.remove')}>
                  <IconButton
                    style={{
                      color: theme.palette.type === 'dark' ? theme.palette.error.light : theme.palette.error.dark
                    }}
                    onClick={() => handleDeleteSource(i)}
                  >
                    <RemoveCircleOutlineOutlinedIcon />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
          ))
        ) : (
          <Typography variant="caption" color="textSecondary">
            {t('updater.sources.none')}
          </Typography>
        )}
      </Grid>

      <Grid item xs={12}>
        <SourceDialog open={dialog} setOpen={setDialog} onSave={handleSaveSource} />
        <Button variant="contained" color="primary" onClick={() => setDialog(true)}>
          {t('updater.sources.add')}
        </Button>
      </Grid>
    </Grid>
  );
};

export default ServiceUpdater;
