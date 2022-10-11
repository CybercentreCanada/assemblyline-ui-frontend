import {
  Button,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  OutlinedInput,
  Radio,
  RadioGroup,
  Select,
  Slider,
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
import { ServiceDetail, Source } from '../service_detail';
import ResetButton from './reset_button';
import SourceDialog from './source_dialog';

type ServiceUpdaterProps = {
  service: ServiceDetail;
  defaults: ServiceDetail;
  setService: (value: ServiceDetail) => void;
  setModified: (value: boolean) => void;
};

const marks = [
  {
    value: 3600,
    label: '1h'
  },
  {
    value: 14400,
    label: '4h'
  },
  {
    value: 21600,
    label: '6h'
  },
  {
    value: 43200,
    label: '12h'
  },
  {
    value: 86400,
    label: '24h'
  }
];

const ServiceUpdater = ({ service, defaults, setService, setModified }: ServiceUpdaterProps) => {
  const { t } = useTranslation(['adminServices']);
  const [dialog, setDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [editedSourceID, setEditedSourceID] = useState(-1);
  const theme = useTheme();

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

  const handleDelimiterChange = event => {
    setModified(true);
    setService({ ...service, update_config: { ...service.update_config, signature_delimiter: event.target.value } });
  };

  const handleCustomDelimiterChange = event => {
    setModified(true);
    setService({ ...service, update_config: { ...service.update_config, custom_delimiter: event.target.value } });
  };

  const handleIntervalChange = event => {
    setModified(true);
    setService({
      ...service,
      update_config: { ...service.update_config, update_interval_seconds: event.target.value }
    });
  };

  const handleSliderChange = (event, number) => {
    setModified(true);
    setService({
      ...service,
      update_config: { ...service.update_config, update_interval_seconds: number }
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

  const findDefaults = (curSource: Source) => {
    if (defaults && defaults.update_config && defaults.update_config.sources) {
      return defaults.update_config.sources.find(element => {
        if (curSource.name === element.name) {
          return element;
        }
        return null;
      });
    }

    return null;
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
      <Grid item xs={12}>
        <Typography variant="subtitle2">
          {t('updater.interval')}
          <ResetButton
            service={service.update_config}
            defaults={defaults.update_config}
            field="update_interval_seconds"
            reset={() => handleSliderChange(null, defaults.update_config.update_interval_seconds)}
          />
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={9}>
            <div style={{ marginLeft: theme.spacing(1), marginRight: theme.spacing(1) }}>
              <Slider
                min={3600}
                max={86400}
                defaultValue={3600}
                valueLabelDisplay="off"
                // getAriaValueText={valuetext}
                aria-labelledby="discrete-slider-custom"
                step={null}
                value={service.update_config.update_interval_seconds}
                marks={marks}
                // marks={true}
                onChange={handleSliderChange}
                valueLabelFormat={x => x / 3600}
              />
            </div>
          </Grid>
          <Grid item xs={12} sm={3}>
            {service ? (
              <OutlinedInput
                fullWidth
                type="number"
                // size="small"
                margin="dense"
                // variant="outlined"
                value={service.update_config.update_interval_seconds}
                onChange={handleIntervalChange}
                endAdornment={<InputAdornment position="end">sec</InputAdornment>}
              />
            ) : (
              <Skeleton style={{ height: '2.5rem' }} />
            )}
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Typography variant="subtitle2">
          {t('updater.signatures')}
          <ResetButton
            service={service.update_config}
            defaults={defaults.update_config}
            field="generates_signatures"
            reset={() => {
              setModified(true);
              setService({
                ...service,
                update_config: {
                  ...service.update_config,
                  generates_signatures: defaults.update_config.generates_signatures
                }
              });
            }}
          />
        </Typography>
        <RadioGroup value={service.update_config.generates_signatures} onChange={toggleSignatures}>
          <FormControlLabel value control={<Radio />} label={t('updater.signatures.yes')} />
          <FormControlLabel value={false} control={<Radio />} label={t('updater.signatures.no')} />
        </RadioGroup>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Typography variant="subtitle2">
          {t('updater.wait')}
          <ResetButton
            service={service.update_config}
            defaults={defaults.update_config}
            field="wait_for_update"
            reset={() => {
              setModified(true);
              setService({
                ...service,
                update_config: {
                  ...service.update_config,
                  wait_for_update: defaults.update_config.wait_for_update
                }
              });
            }}
          />
        </Typography>
        <RadioGroup value={service.update_config.wait_for_update} onChange={toggleWaitForUpdate}>
          <FormControlLabel value control={<Radio />} label={t('updater.wait.yes')} />
          <FormControlLabel value={false} control={<Radio />} label={t('updater.wait.no')} />
        </RadioGroup>
      </Grid>

      {service && service.update_config.generates_signatures && (
        <Grid item xs={12}>
          <Typography variant="subtitle2">
            {t('updater.signature_delimiter')}
            <ResetButton
              service={service.update_config}
              defaults={defaults.update_config}
              field={['signature_delimiter', 'custom_delimiter']}
              reset={() => {
                setModified(true);
                setService({
                  ...service,
                  update_config: {
                    ...service.update_config,
                    signature_delimiter: defaults.update_config.signature_delimiter,
                    custom_delimiter: defaults.update_config.custom_delimiter || ''
                  }
                });
              }}
            />
          </Typography>
          <Grid container spacing={1}>
            <Grid
              item
              xs={12}
              sm={service.update_config.signature_delimiter === 'custom' ? 7 : 12}
              md={service.update_config.signature_delimiter === 'custom' ? 8 : 12}
            >
              <Select
                id="delimiter"
                fullWidth
                value={service.update_config.signature_delimiter}
                onChange={handleDelimiterChange}
                variant="outlined"
                margin="dense"
                style={{ marginTop: theme.spacing(1), marginBottom: theme.spacing(0.5) }}
              >
                <MenuItem value="new_line">{t('updater.signature_delimiter.new_line')}</MenuItem>
                <MenuItem value="double_new_line">{t('updater.signature_delimiter.double_new_line')}</MenuItem>
                <MenuItem value="pipe">{t('updater.signature_delimiter.pipe')}</MenuItem>
                <MenuItem value="comma">{t('updater.signature_delimiter.comma')}</MenuItem>
                <MenuItem value="space">{t('updater.signature_delimiter.space')}</MenuItem>
                <MenuItem value="none">{t('updater.signature_delimiter.none')}</MenuItem>
                <MenuItem value="file">{t('updater.signature_delimiter.file')}</MenuItem>
                <MenuItem value="custom">{t('updater.signature_delimiter.custom')}</MenuItem>
              </Select>
            </Grid>
            {service.update_config.signature_delimiter === 'custom' && (
              <Grid item xs={12} sm={5} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  variant="outlined"
                  value={service.update_config.custom_delimiter ? service.update_config.custom_delimiter : ''}
                  onChange={handleCustomDelimiterChange}
                />
              </Grid>
            )}
          </Grid>
        </Grid>
      )}

      <Grid item xs={12}>
        <Typography variant="subtitle2">{t('updater.sources')}</Typography>
        <SourceDialog
          open={editDialog}
          source={editedSourceID !== -1 ? service.update_config.sources[editedSourceID] : null}
          defaults={editedSourceID !== -1 ? findDefaults(service.update_config.sources[editedSourceID]) : null}
          setOpen={setEditDialog}
          onSave={handleSaveSource}
        />
        {service.update_config.sources.length !== 0 ? (
          service.update_config.sources.map((source, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ paddingRight: theme.spacing(1), flexGrow: 1 }}>
                <SourceCard
                  key={i}
                  source={source}
                  service={service.name}
                  onClick={() => handleEditSource(i)}
                  showDetails={false}
                />
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
