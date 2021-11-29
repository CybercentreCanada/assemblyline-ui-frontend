import {
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
import useALContext from 'components/hooks/useALContext';
import Classification from 'components/visual/Classification';
import 'moment/locale/fr';
import { useTranslation } from 'react-i18next';
import { ServiceConstants, ServiceDetail } from '../service_detail';

type ServiceGeneralProps = {
  service: ServiceDetail;
  constants: ServiceConstants;
  versions: string[];
  setService: (value: ServiceDetail) => void;
  setModified: (value: boolean) => void;
};

const ServiceGeneral = ({ service, constants, versions, setService, setModified }: ServiceGeneralProps) => {
  const { t } = useTranslation(['adminServices']);
  const theme = useTheme();
  const { c12nDef } = useALContext();

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

  const setClassification = default_result_classification => {
    setModified(true);
    setService({ ...service, default_result_classification });
  };

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
          <Typography variant="subtitle2">{t('general.version')}</Typography>
          {service ? (
            <Select
              id="version"
              fullWidth
              value={service.version}
              onChange={handleVersionChange}
              variant="outlined"
              margin="dense"
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
          ) : (
            <Skeleton style={{ height: '2.5rem' }} />
          )}
        </Grid>
        {c12nDef.enforce && (
          <Grid item xs={12}>
            <Typography variant="subtitle2">{t('general.classification')}</Typography>
            <Classification
              type="picker"
              c12n={service ? service.default_result_classification : null}
              setClassification={setClassification}
            />
          </Grid>
        )}
        <Grid item xs={12}>
          <Typography variant="subtitle2">{t('general.description')}</Typography>
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
          <Typography variant="subtitle2">{t('general.stage')}</Typography>
          {service ? (
            <Select
              id="stage"
              fullWidth
              value={service.stage}
              onChange={handleStageChange}
              variant="outlined"
              margin="dense"
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
          ) : (
            <Skeleton style={{ height: '2.5rem' }} />
          )}
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2">{t('general.category')}</Typography>
          {service ? (
            <Select
              id="category"
              fullWidth
              value={service.category}
              onChange={handleCategoryChange}
              variant="outlined"
              margin="dense"
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
          ) : (
            <Skeleton style={{ height: '2.5rem' }} />
          )}
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2">{t('general.accept')}</Typography>
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
          <Typography variant="subtitle2">{t('general.reject')}</Typography>
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
          </Typography>
          {service ? (
            <TextField
              fullWidth
              type="number"
              size="small"
              margin="dense"
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
            {t('general.licence')}
          </Typography>
          {service ? (
            <TextField
              fullWidth
              type="number"
              size="small"
              margin="dense"
              variant="outlined"
              InputProps={{ inputProps: { min: 0 } }}
              onChange={handleLicenceChange}
              value={service.licence_count}
            />
          ) : (
            <Skeleton style={{ height: '2.5rem' }} />
          )}
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant="subtitle2" noWrap>
            {t('general.max_queue_length')}
          </Typography>
          {service ? (
            <TextField
              fullWidth
              type="number"
              size="small"
              margin="dense"
              variant="outlined"
              InputProps={{ inputProps: { min: 0 } }}
              onChange={handleMaxQueueSizeChange}
              value={service.max_queue_length}
            />
          ) : (
            <Skeleton style={{ height: '2.5rem' }} />
          )}
          <Typography variant="caption">{t('general.max_queue_length.desc')}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2">{t('general.location')}</Typography>
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
          <Typography variant="subtitle2">{t('general.caching')}</Typography>
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
