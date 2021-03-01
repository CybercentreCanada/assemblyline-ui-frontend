import {
  Button,
  FormControlLabel,
  Grid,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
  useTheme
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { SourceCard } from 'components/routes/manage/signature_sources';
import 'moment/locale/fr';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ServiceDetail } from '../service_detail';
import ContainerCard from './container_card';

type ServiceUpdaterProps = {
  service: ServiceDetail;
  setService: (value: ServiceDetail) => void;
  setModified: (value: boolean) => void;
};

const ServiceUpdater = ({ service, setService, setModified }: ServiceUpdaterProps) => {
  const { t } = useTranslation(['adminServices']);
  const [dialog, setDialog] = useState(false);
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
        {service.update_config.sources.map((source, i) => {
          return <SourceCard key={i} source={source} onClick={() => console.log(source)} />;
        })}
      </Grid>

      <Grid item xs={12}>
        {/* <ContainerDialog open={dialog} setOpen={setDialog} name="" volumes={{}} onSave={handleDependencyChange} /> */}
        <Button variant="contained" color="primary" onClick={() => setDialog(true)}>
          {t('updater.sources.add')}
        </Button>
      </Grid>
    </Grid>
  );
};

export default ServiceUpdater;
