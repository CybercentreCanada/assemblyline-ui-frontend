import StarIcon from '@mui/icons-material/Star';
import {
  Chip,
  FormControlLabel,
  Grid,
  LinearProgress,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Skeleton,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import useALContext from 'components/hooks/useALContext';
import type { ServiceConstants, ServiceDetail } from 'components/routes/admin/service_detail';
import Classification from 'components/visual/Classification';
import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ResetButton from './reset_button';

type ServiceGeneralProps = {
  constants: ServiceConstants;
  defaults: ServiceDetail;
  service: ServiceDetail;
  serviceNames: string[];
  versions: string[];
  setError: Dispatch<SetStateAction<boolean>>;
  setModified: Dispatch<SetStateAction<boolean>>;
  setService: Dispatch<SetStateAction<ServiceDetail>>;
};

const ServiceGeneral = ({
  constants,
  defaults,
  service,
  serviceNames,
  versions,
  setError,
  setModified,
  setService
}: ServiceGeneralProps) => {
  const { t } = useTranslation(['adminServices']);
  const theme = useTheme();
  const { c12nDef } = useALContext();

  const [instancesError, setInstancesError] = useState<boolean>(false);

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

  if (!constants || !defaults || !service || !serviceNames || !versions) {
    return <LinearProgress />;
  } else {
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
                  setService(s => ({ ...s, version: defaults.version }));
                }}
              />
            </Typography>

            {service ? (
              <FormControl size="small" fullWidth>
                <Select
                  id="version"
                  fullWidth
                  variant="outlined"
                  style={{ marginTop: theme.spacing(1), marginBottom: theme.spacing(0.5) }}
                  value={service.version}
                  onChange={e => {
                    setModified(true);
                    setService(s => ({ ...s, version: e.target.value }));
                  }}
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
                  reset={() => {
                    setModified(true);
                    setService(s => ({ ...s, classification: defaults.classification }));
                  }}
                />
              </Typography>
              <Classification
                type="picker"
                c12n={service ? service.classification : null}
                setClassification={classification => {
                  setModified(true);
                  setService(s => ({ ...s, classification }));
                }}
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
                  reset={() => {
                    setModified(true);
                    setService(s => ({ ...s, default_result_classification: defaults.default_result_classification }));
                  }}
                />
              </Typography>
              <Classification
                type="picker"
                c12n={service ? service.default_result_classification : null}
                setClassification={c => {
                  setModified(true);
                  setService(s => ({ ...s, default_result_classification: c }));
                }}
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
                  setService(s => ({ ...s, description: defaults.description }));
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
                value={service.description}
                onChange={e => {
                  setModified(true);
                  setService(s => ({ ...s, description: e.target.value }));
                }}
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
                  setService(s => ({ ...s, stage: defaults.stage }));
                }}
              />
            </Typography>
            {service ? (
              <FormControl size="small" fullWidth>
                <Select
                  id="stage"
                  fullWidth
                  value={service.stage}
                  variant="outlined"
                  style={{ marginTop: theme.spacing(1), marginBottom: theme.spacing(0.5) }}
                  onChange={e => {
                    setModified(true);
                    setService(s => ({ ...s, stage: e.target.value }));
                  }}
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
                  setService(s => ({ ...s, category: defaults.category }));
                }}
              />
            </Typography>
            {service ? (
              <FormControl size="small" fullWidth>
                <Select
                  id="category"
                  fullWidth
                  value={service.category}
                  variant="outlined"
                  style={{ marginTop: theme.spacing(1), marginBottom: theme.spacing(0.5) }}
                  onChange={e => {
                    setModified(true);
                    setService(s => ({ ...s, category: e.target.value }));
                  }}
                >
                  {constants?.categories ? (
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
                  setService(s => ({ ...s, accepts: defaults.accepts }));
                }}
              />
            </Typography>
            {service ? (
              <TextField
                fullWidth
                size="small"
                margin="dense"
                variant="outlined"
                value={service.accepts}
                onChange={e => {
                  setModified(true);
                  setService(s => ({ ...s, accepts: e.target.value }));
                }}
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
                  setService(s => ({ ...s, rejects: defaults.rejects }));
                }}
              />
            </Typography>
            {service ? (
              <TextField
                fullWidth
                size="small"
                margin="dense"
                variant="outlined"
                onChange={e => {
                  setModified(true);
                  setService(s => ({ ...s, rejects: e.target.value }));
                }}
                value={service.rejects}
              />
            ) : (
              <Skeleton style={{ height: '2.5rem' }} />
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">
              {t('general.recursion_prevention')}
              <ResetButton
                service={service}
                defaults={{ recursion_prevention: [], ...defaults }}
                field="recursion_prevention"
                reset={() => {
                  setModified(true);
                  setService(s => ({ ...s, recursion_prevention: defaults?.recursion_prevention || [] }));
                }}
              />
            </Typography>
            {service ? (
              <Autocomplete
                fullWidth
                multiple
                freeSolo
                size="small"
                disableCloseOnSelect
                filterSelectedOptions={true}
                value={service.recursion_prevention}
                options={[...constants.categories, ...serviceNames]}
                isOptionEqualToValue={(option, value) => option.toUpperCase() === value.toUpperCase()}
                onChange={(_e, values) => {
                  setModified(true);
                  setService(s => ({ ...s, recursion_prevention: values.toSorted() }));
                }}
                renderInput={params => <TextField size="small" margin="dense" {...params} variant="outlined" />}
                renderOption={(props, option, state) => (
                  <li {...props} key={`${option}-${state.index}`} style={{ columnGap: theme.spacing(1) }}>
                    {constants.categories.includes(option) ? (
                      <StarIcon fontSize="small" />
                    ) : (
                      <div style={{ width: '20px' }} />
                    )}
                    {option}
                  </li>
                )}
                renderTags={(values, getTagProps) =>
                  values.map((value, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={index}
                      size="small"
                      label={value}
                      avatar={constants.categories.includes(value) ? <StarIcon fontSize="small" /> : null}
                    />
                  ))
                }
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
                  setService(s => ({ ...s, timeout: defaults.timeout }));
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
                value={service.timeout}
                onChange={e => {
                  setModified(true);
                  setService(s => ({ ...s, timeout: Number(e.target.value) }));
                }}
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
                  setService(s => ({
                    ...s,
                    licence_count: defaults.licence_count,
                    min_instances: defaults.min_instances
                  }));
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
                    value={service.min_instances > 0 ? service.min_instances : ''}
                    error={instancesError}
                    InputProps={{
                      inputProps: { min: 0, max: service.licence_count },
                      endAdornment: <InputAdornment position="end">↓</InputAdornment>
                    }}
                    onChange={e => {
                      const value = Number(e.target.value);
                      setModified(true);
                      setService(s => ({
                        ...s,
                        min_instances: !e.target.value ? 0 : Math.min(s.licence_count, value)
                      }));
                    }}
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
                    value={service.licence_count > 0 ? service.licence_count : ''}
                    placeholder={t('limit.none')}
                    error={instancesError}
                    InputProps={{
                      inputProps: { min: 0 },
                      endAdornment: <InputAdornment position="end">↑</InputAdornment>
                    }}
                    onChange={e => {
                      const value = Number(e.target.value);
                      setModified(true);
                      setService(s => ({
                        ...s,
                        ...(!e.target.value
                          ? { min_instances: 0, licence_count: 0 }
                          : { min_instances: Math.min(s.min_instances, value), licence_count: value })
                      }));
                    }}
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
                  setService(s => ({ ...s, max_queue_length: defaults.max_queue_length }));
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
                value={service.max_queue_length > 0 ? service.max_queue_length : ''}
                InputProps={{ inputProps: { min: 0 } }}
                onChange={e => {
                  setModified(true);
                  setService(s => ({ ...s, max_queue_length: Number(e.target.value) }));
                }}
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
                  setService(s => ({ ...s, is_external: defaults.is_external }));
                }}
              />
            </Typography>
            {service ? (
              <RadioGroup
                value={service.is_external}
                onChange={() => {
                  setModified(true);
                  setService(s => ({ ...s, is_external: !s.is_external }));
                }}
              >
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
                  setService(s => ({ ...s, disable_cache: defaults.disable_cache }));
                }}
              />
            </Typography>
            {service ? (
              <RadioGroup
                value={service.disable_cache}
                onChange={() => {
                  setModified(true);
                  setService(s => ({ ...s, disable_cache: !s.disable_cache }));
                }}
              >
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
  }
};

export default ServiceGeneral;
