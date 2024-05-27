import {
  FormControlLabel,
  Grid,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Skeleton,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import useALContext from 'components/hooks/useALContext';
import Classification from 'components/visual/Classification';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ServiceConstants, ServiceDetail } from '../service_detail';
import ResetButton from './reset_button';

type ServiceGeneralProps = {
  service: ServiceDetail;
  defaults: ServiceDetail;
  constants: ServiceConstants;
  versions: string[];
  setService: (value: ServiceDetail) => void;
  setModified: (value: boolean) => void;
  setError: (value: boolean) => void;
};

const ServiceGeneral = ({
  service,
  defaults,
  constants,
  versions,
  setService,
  setModified,
  setError
}: ServiceGeneralProps) => {
  const { t } = useTranslation(['adminServices']);
  const theme = useTheme();
  const { c12nDef } = useALContext();
  const [instancesError, setInstancesError] = useState<boolean>(false);

  const handleDescriptionChange = event => {
    setModified(true);
    setService({ ...service, description: event.target.value });
  };

  const handleVersionChange = event => {
    setModified(true);
    setService({ ...service, version: event.target.value });
  };

  const handleStageChange = event => {
    setModified(true);
    setService({ ...service, stage: event.target.value });
  };

  const handleCategoryChange = event => {
    setModified(true);
    setService({ ...service, category: event.target.value });
  };

  const handleAcceptChange = event => {
    setModified(true);
    setService({ ...service, accepts: event.target.value });
  };

  const handleRejectChange = event => {
    setModified(true);
    setService({ ...service, rejects: event.target.value });
  };

  const handleTimeoutChange = event => {
    setModified(true);
    setService({ ...service, timeout: event.target.value });
  };

  const handleMinInstancesChange = event => {
    setModified(true);
    setService({ ...service, min_instances: event.target.value === '' ? null : event.target.value });
  };

  const handleLicenceChange = event => {
    setModified(true);
    setService({ ...service, licence_count: event.target.value });
  };

  const handleMaxQueueSizeChange = event => {
    setModified(true);
    setService({ ...service, max_queue_length: event.target.value });
  };

  const handleExternalToggle = () => {
    setModified(true);
    setService({ ...service, is_external: !service.is_external });
  };

  const handleCacheToggle = () => {
    setModified(true);
    setService({ ...service, disable_cache: !service.disable_cache });
  };

  const setResultClassification = default_result_classification => {
    setModified(true);
    setService({ ...service, default_result_classification });
  };

  const setClassification = classification => {
    setModified(true);
    setService({ ...service, classification });
  };

  useEffect(() => {
    // Set global error flag to be communicated back to main page
    setError(instancesError);

    // eslint-disable-next-line
  }, [instancesError]);

  useEffect(() => {
    // Check for issues with range selection
    if (service.licence_count < 1) {
      // Maximum has no limit, so settings are always valid
    } else if (service.min_instances >= 0 && service.min_instances > service.licence_count) {
      // Minimum number of instances should never surpass maximum
      setInstancesError(true);
      return;
    }
    setInstancesError(false);

    // eslint-disable-next-line
  }, [service.min_instances, service.licence_count]);

  return (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2">{t('general.name')}</Typography>
          {service ? (
            <TextField fullWidth size="small" margin="dense" variant="outlined" disabled value={service.name} />
          ) : (
            <Skeleton style={{ height: '2.5rem' }} />
          )}
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2">
            {t('general.version')}
            <ResetButton
              service={service}
              defaults={defaults}
              field="version"
              reset={() => {
                setModified(true);
                setService({ ...service, version: defaults.version });
              }}
            />
          </Typography>

          {service ? (
            <FormControl size="small" fullWidth>
              <Select
                id="version"
                fullWidth
                value={service.version}
                onChange={handleVersionChange}
                variant="outlined"
                style={{ marginTop: theme.spacing(1), marginBottom: theme.spacing(0.5) }}
              >
                {versions ? (
                  versions.map((v, i) => (
                    <MenuItem key={i} value={v}>
                      {v}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value={service.version}>{service.version}</MenuItem>
                )}
              </Select>
            </FormControl>
          ) : (
            <Skeleton style={{ height: '2.5rem' }} />
          )}
        </Grid>
        {c12nDef.enforce && (
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">
              {t('general.classification')}
              <ResetButton
                service={service}
                defaults={defaults}
                field="classification"
                reset={() => setClassification(defaults.classification)}
              />
            </Typography>
            <Classification
              type="picker"
              c12n={service ? service.classification : null}
              setClassification={setClassification}
            />
          </Grid>
        )}
        {c12nDef.enforce && (
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">
              {t('general.result_classification')}
              <ResetButton
                service={service}
                defaults={defaults}
                field="default_result_classification"
                reset={() => setResultClassification(defaults.default_result_classification)}
              />
            </Typography>
            <Classification
              type="picker"
              c12n={service ? service.default_result_classification : null}
              setClassification={setResultClassification}
            />
          </Grid>
        )}
        <Grid item xs={12}>
          <Typography variant="subtitle2">
            {t('general.description')}
            <ResetButton
              service={service}
              defaults={defaults}
              field="description"
              reset={() => {
                setModified(true);
                setService({ ...service, description: defaults.description });
              }}
            />
          </Typography>
          {service ? (
            <TextField
              fullWidth
              size="small"
              multiline
              rows={6}
              margin="dense"
              variant="outlined"
              onChange={handleDescriptionChange}
              value={service.description}
            />
          ) : (
            <Skeleton style={{ height: '2.5rem' }} />
          )}
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2">
            {t('general.stage')}
            <ResetButton
              service={service}
              defaults={defaults}
              field="stage"
              reset={() => {
                setModified(true);
                setService({ ...service, stage: defaults.stage });
              }}
            />
          </Typography>
          {service ? (
            <FormControl size="small" fullWidth>
              <Select
                id="stage"
                fullWidth
                value={service.stage}
                onChange={handleStageChange}
                variant="outlined"
                style={{ marginTop: theme.spacing(1), marginBottom: theme.spacing(0.5) }}
              >
                {constants ? (
                  constants.stages.map((s, i) => (
                    <MenuItem key={i} value={s}>
                      {s}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value={service.stage}>{service.stage}</MenuItem>
                )}
              </Select>
            </FormControl>
          ) : (
            <Skeleton style={{ height: '2.5rem' }} />
          )}
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2">
            {t('general.category')}
            <ResetButton
              service={service}
              defaults={defaults}
              field="category"
              reset={() => {
                setModified(true);
                setService({ ...service, category: defaults.category });
              }}
            />
          </Typography>
          {service ? (
            <FormControl size="small" fullWidth>
              <Select
                id="category"
                fullWidth
                value={service.category}
                onChange={handleCategoryChange}
                variant="outlined"
                style={{ marginTop: theme.spacing(1), marginBottom: theme.spacing(0.5) }}
              >
                {constants ? (
                  constants.categories.map((c, i) => (
                    <MenuItem key={i} value={c}>
                      {c}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value={service.category}>{service.category}</MenuItem>
                )}
              </Select>
            </FormControl>
          ) : (
            <Skeleton style={{ height: '2.5rem' }} />
          )}
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2">
            {t('general.accept')}
            <ResetButton
              service={service}
              defaults={defaults}
              field="accepts"
              reset={() => {
                setModified(true);
                setService({ ...service, accepts: defaults.accepts });
              }}
            />
          </Typography>
          {service ? (
            <TextField
              fullWidth
              size="small"
              margin="dense"
              variant="outlined"
              onChange={handleAcceptChange}
              value={service.accepts}
            />
          ) : (
            <Skeleton style={{ height: '2.5rem' }} />
          )}
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2">
            {t('general.reject')}
            <ResetButton
              service={service}
              defaults={defaults}
              field="rejects"
              reset={() => {
                setModified(true);
                setService({ ...service, rejects: defaults.rejects });
              }}
            />
          </Typography>
          {service ? (
            <TextField
              fullWidth
              size="small"
              margin="dense"
              variant="outlined"
              onChange={handleRejectChange}
              value={service.rejects}
            />
          ) : (
            <Skeleton style={{ height: '2.5rem' }} />
          )}
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant="subtitle2" noWrap>
            {t('general.timeout')}
            <ResetButton
              service={service}
              defaults={defaults}
              field="timeout"
              reset={() => {
                setModified(true);
                setService({ ...service, timeout: defaults.timeout });
              }}
            />
          </Typography>
          {service ? (
            <TextField
              fullWidth
              type="number"
              margin="dense"
              size="small"
              variant="outlined"
              InputProps={{ inputProps: { min: 5 } }}
              onChange={handleTimeoutChange}
              value={service.timeout}
            />
          ) : (
            <Skeleton style={{ height: '2.5rem' }} />
          )}
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant="subtitle2" noWrap>
            {t('general.instances')}
            <ResetButton
              service={service}
              defaults={defaults}
              field={['licence_count', 'min_instances']}
              reset={() => {
                setModified(true);
                setService({
                  ...service,
                  licence_count: defaults.licence_count,
                  min_instances: defaults.min_instances
                });
              }}
            />
          </Typography>
          <Grid container spacing={theme.spacing(1)}>
            <Grid item xs={12} sm={6}>
              {service ? (
                <TextField
                  fullWidth
                  type="number"
                  margin="dense"
                  size="small"
                  variant="outlined"
                  placeholder={t('limit.system_default')}
                  InputProps={{
                    inputProps: { min: 0, max: service.licence_count },
                    endAdornment: <InputAdornment position="end">↓</InputAdornment>
                  }}
                  onChange={handleMinInstancesChange}
                  value={service.min_instances}
                  error={instancesError}
                />
              ) : (
                <Skeleton style={{ height: '2.5rem' }} />
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              {service ? (
                <TextField
                  fullWidth
                  type="number"
                  margin="dense"
                  size="small"
                  variant="outlined"
                  InputProps={{
                    inputProps: { min: 0 },
                    endAdornment: <InputAdornment position="end">↑</InputAdornment>
                  }}
                  onChange={handleLicenceChange}
                  value={service.licence_count > 0 ? service.licence_count : ''}
                  placeholder={t('limit.none')}
                  error={instancesError}
                />
              ) : (
                <Skeleton style={{ height: '2.5rem' }} />
              )}
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant="subtitle2" noWrap>
            {t('general.max_queue_length')}
            <ResetButton
              service={service}
              defaults={defaults}
              field="max_queue_length"
              reset={() => {
                setModified(true);
                setService({ ...service, max_queue_length: defaults.max_queue_length });
              }}
            />
          </Typography>
          {service ? (
            <TextField
              fullWidth
              type="number"
              margin="dense"
              size="small"
              variant="outlined"
              placeholder={t('limit.none')}
              InputProps={{ inputProps: { min: 0 } }}
              onChange={handleMaxQueueSizeChange}
              value={service.max_queue_length > 0 ? service.max_queue_length : ''}
            />
          ) : (
            <Skeleton style={{ height: '2.5rem' }} />
          )}
          <Typography variant="caption">{t('general.max_queue_length.desc')}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2">
            {t('general.location')}
            <ResetButton
              service={service}
              defaults={defaults}
              field="is_external"
              reset={() => {
                setModified(true);
                setService({ ...service, is_external: defaults.is_external });
              }}
            />
          </Typography>
          {service ? (
            <RadioGroup value={service.is_external} onChange={handleExternalToggle}>
              <FormControlLabel value control={<Radio />} label={t('general.location.external')} />
              <FormControlLabel value={false} control={<Radio />} label={t('general.location.internal')} />
            </RadioGroup>
          ) : (
            <Skeleton style={{ height: '2.5rem' }} />
          )}
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2">
            {t('general.caching')}
            <ResetButton
              service={service}
              defaults={defaults}
              field="disable_cache"
              reset={() => {
                setModified(true);
                setService({ ...service, disable_cache: defaults.disable_cache });
              }}
            />
          </Typography>
          {service ? (
            <RadioGroup value={service.disable_cache} onChange={handleCacheToggle}>
              <FormControlLabel value={false} control={<Radio />} label={t('general.caching.enabled')} />
              <FormControlLabel value control={<Radio />} label={t('general.caching.disabled')} />
            </RadioGroup>
          ) : (
            <Skeleton style={{ height: '2.5rem' }} />
          )}
        </Grid>
      </Grid>
    </div>
  );
};

export default ServiceGeneral;
