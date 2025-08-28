import StarIcon from '@mui/icons-material/Star';
import { Chip, Grid, LinearProgress, useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import type { Service, ServiceConstants } from 'components/models/base/service';
import { showReset } from 'components/routes/admin/service_detail/service.utils';
import { CheckboxInput } from 'components/visual/Inputs/CheckboxInput';
import { ChipsInput } from 'components/visual/Inputs/ChipsInput';
import { ClassificationInput } from 'components/visual/Inputs/ClassificationInput';
import { NumberInput } from 'components/visual/Inputs/NumberInput';
import { RadioInput } from 'components/visual/Inputs/RadioInput';
import { SelectInput } from 'components/visual/Inputs/SelectInput';
import { TextAreaInput } from 'components/visual/Inputs/TextAreaInput';
import { TextInput } from 'components/visual/Inputs/TextInput';
import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type ServiceGeneralProps = {
  service: Service;
  defaults: Service;
  constants: ServiceConstants;
  serviceNames: string[];
  versions: string[];
  setError: Dispatch<SetStateAction<boolean>>;
  setModified: Dispatch<SetStateAction<boolean>>;
  setService: Dispatch<SetStateAction<Service>>;
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
  }, [service.min_instances, service.licence_count]);

  if (!constants || !defaults || !service || !serviceNames || !versions) {
    return <LinearProgress />;
  } else {
    return (
      <div>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput label={t('general.name')} disabled loading={!service} value={!service ? null : service.name} />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <SelectInput
              label={t('general.version')}
              loading={!service}
              value={!service ? null : service.version}
              defaultValue={!service ? undefined : defaults?.version}
              reset={showReset(service, defaults, 'version')}
              options={versions.map(v => ({ primary: v, value: v }))}
              onChange={(e, v) => {
                setModified(true);
                setService(s => ({ ...s, version: v }));
              }}
            />
            <CheckboxInput
              label={t('general.auto_update')}
              tiny
              loading={!service}
              value={!service ? null : service.auto_update}
              defaultValue={!service ? undefined : defaults?.auto_update}
              reset={showReset(service, defaults, 'auto_update')}
              onChange={() => {
                setModified(true);
                setService(s => ({ ...s, auto_update: !s.auto_update }));
              }}
            />
          </Grid>

          {c12nDef.enforce && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <ClassificationInput
                label={t('general.classification')}
                loading={!service}
                value={!service ? null : service.classification}
                defaultValue={!service ? undefined : defaults?.classification}
                reset={showReset(service, defaults, 'classification')}
                onChange={(e, v) => {
                  setModified(true);
                  setService(s => ({ ...s, classification: v }));
                }}
              />
            </Grid>
          )}

          {c12nDef.enforce && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <ClassificationInput
                label={t('general.result_classification')}
                loading={!service}
                value={!service ? null : service.default_result_classification}
                defaultValue={!service ? undefined : defaults?.default_result_classification}
                reset={showReset(service, defaults, 'default_result_classification')}
                onChange={(e, v) => {
                  setModified(true);
                  setService(s => ({ ...s, default_result_classification: v }));
                }}
              />
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <TextAreaInput
              label={t('general.description')}
              loading={!service}
              value={!service ? null : service.description}
              defaultValue={!service ? undefined : defaults?.description}
              reset={showReset(service, defaults, 'description')}
              rows={6}
              onChange={(e, v) => {
                setModified(true);
                setService(s => ({ ...s, description: v }));
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <SelectInput
              label={t('general.stage')}
              loading={!service}
              value={!service ? null : service.stage}
              defaultValue={!service ? undefined : defaults?.stage}
              reset={showReset(service, defaults, 'stage')}
              options={
                !constants
                  ? [{ primary: service.stage, value: service.stage }]
                  : constants.stages.map(s => ({ primary: s, value: s }))
              }
              onChange={(e, v) => {
                setModified(true);
                setService(s => ({ ...s, stage: v }));
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <SelectInput
              label={t('general.category')}
              loading={!service}
              value={!service ? null : service.category}
              defaultValue={!service ? undefined : defaults?.category}
              reset={showReset(service, defaults, 'category')}
              options={
                !constants
                  ? [{ primary: service.category, value: service.category }]
                  : constants.categories.map(s => ({ primary: s, value: s }))
              }
              onChange={(e, v) => {
                setModified(true);
                setService(s => ({ ...s, category: v }));
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label={t('general.accept')}
              loading={!service}
              value={!service ? null : service.accepts}
              defaultValue={!service ? undefined : defaults?.accepts}
              reset={showReset(service, defaults, 'accepts')}
              onChange={(e, v) => {
                setModified(true);
                setService(s => ({ ...s, accepts: v }));
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label={t('general.reject')}
              loading={!service}
              value={!service ? null : service.rejects}
              defaultValue={!service ? undefined : defaults?.rejects}
              reset={showReset(service, defaults, 'rejects')}
              onChange={(e, v) => {
                setModified(true);
                setService(s => ({ ...s, rejects: v }));
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <ChipsInput
              label={t('general.recursion_prevention')}
              loading={!service}
              value={!service ? null : service.recursion_prevention}
              defaultValue={!service ? undefined : defaults?.recursion_prevention}
              reset={showReset(service, defaults, 'recursion_prevention')}
              options={[...constants.categories, ...serviceNames]}
              isOptionEqualToValue={(option, value) => option.toUpperCase() === value.toUpperCase()}
              disableCloseOnSelect
              filterSelectedOptions
              onChange={(e, v) => {
                setModified(true);
                setService(s => ({ ...s, recursion_prevention: v }));
              }}
              renderOption={(props, option, state) => (
                <li {...props} key={`${option}-${state.index}`} style={{ columnGap: theme.spacing(1) }}>
                  {constants.categories.includes(option as unknown as string) ? (
                    <StarIcon fontSize="small" />
                  ) : (
                    <div style={{ width: '20px' }} />
                  )}
                  {option}
                </li>
              )}
              renderValue={(values, getTagProps) =>
                (values as unknown as string[]).map((value, index) => (
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
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <NumberInput
              label={t('general.timeout')}
              loading={!service}
              min={5}
              required
              value={!service ? null : service.timeout}
              defaultValue={!service ? undefined : defaults?.timeout}
              reset={showReset(service, defaults, 'timeout')}
              onChange={(e, v) => {
                setModified(true);
                setService(s => ({ ...s, timeout: v }));
              }}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <NumberInput
              label={t('general.instances')}
              loading={!service}
              placeholder={t('limit.system_default')}
              value={!service ? null : service.min_instances > 0 ? service.min_instances : null}
              defaultValue={!service ? undefined : defaults?.min_instances || 0}
              reset={showReset(service, defaults, 'min_instances')}
              min={0}
              {...(service.licence_count && { max: service.licence_count })}
              endAdornment="↓"
              error={val =>
                service.licence_count > 0 && val > service.licence_count ? t('general.instances.error') : null
              }
              onChange={(e, v) => {
                setModified(true);
                setService(s => ({ ...s, min_instances: !v ? 0 : s.licence_count ? Math.min(s.licence_count, v) : v }));
              }}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <NumberInput
              id="licence_count"
              loading={!service}
              placeholder={t('limit.none')}
              value={!service ? null : service.licence_count > 0 ? service.licence_count : null}
              defaultValue={!service ? undefined : defaults?.licence_count || 0}
              reset={showReset(service, defaults, 'licence_count')}
              min={0}
              endAdornment="↑"
              onChange={(e, v) => {
                setModified(true);
                setService(s => ({
                  ...s,
                  ...(!v
                    ? { min_instances: 0, licence_count: 0 }
                    : { min_instances: Math.min(s.min_instances, v), licence_count: v })
                }));
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <NumberInput
              label={t('general.max_queue_length')}
              loading={!service}
              placeholder={t('limit.none')}
              helperText={t('general.max_queue_length.desc')}
              value={!service ? null : service.max_queue_length > 0 ? service.max_queue_length : null}
              defaultValue={!service ? undefined : defaults?.max_queue_length}
              reset={showReset(service, defaults, 'max_queue_length')}
              min={0}
              onChange={(e, v) => {
                setModified(true);
                setService(s => ({ ...s, max_queue_length: v }));
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <RadioInput
              label={t('general.location')}
              loading={!service}
              value={!service ? null : service.is_external}
              defaultValue={!service ? undefined : defaults?.is_external}
              reset={showReset(service, defaults, 'is_external')}
              options={
                [
                  { value: true, label: t('general.location.external') },
                  { value: false, label: t('general.location.internal') }
                ] as const
              }
              onChange={(e, v) => {
                setModified(true);
                setService(s => ({ ...s, is_external: v }));
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <RadioInput
              label={t('general.caching')}
              loading={!service}
              value={!service ? null : service.disable_cache}
              defaultValue={!service ? undefined : defaults?.disable_cache}
              reset={showReset(service, defaults, 'disable_cache')}
              options={
                [
                  { value: false, label: t('general.caching.enabled') },
                  { value: true, label: t('general.caching.disabled') }
                ] as const
              }
              onChange={(e, v) => {
                setModified(true);
                setService(s => ({ ...s, disable_cache: v }));
              }}
            />
          </Grid>
        </Grid>
      </div>
    );
  }
};

export default ServiceGeneral;
