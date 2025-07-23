import StarIcon from '@mui/icons-material/Star';
import { Chip, Grid, LinearProgress, useTheme } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import useALContext from 'components/hooks/useALContext';
import type { Service, ServiceConstants } from 'components/models/base/service';
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
              defaultValue={!defaults ? undefined : defaults?.version}
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
              defaultValue={!defaults ? undefined : defaults?.auto_update}
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
                defaultValue={!defaults ? undefined : defaults?.classification}
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
                defaultValue={!defaults ? undefined : defaults?.default_result_classification}
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
              defaultValue={!defaults ? undefined : defaults?.description}
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
              defaultValue={!defaults ? undefined : defaults?.stage}
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
              defaultValue={!defaults ? undefined : defaults?.category}
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
              defaultValue={!defaults ? undefined : defaults?.accepts}
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
              defaultValue={!defaults ? undefined : defaults?.rejects}
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
              defaultValue={!defaults ? undefined : defaults?.recursion_prevention}
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
              renderTags={(values, getTagProps) =>
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
              value={!service ? null : service.timeout}
              defaultValue={!defaults ? undefined : defaults?.timeout}
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
              defaultValue={!defaults ? undefined : defaults?.min_instances}
              min={0}
              {...(service.licence_count && { max: service.licence_count })}
              endAdornment={<InputAdornment position="end">{'↓'}</InputAdornment>}
              error={() =>
                service.licence_count < 1
                  ? null
                  : service.min_instances >= 0 && service.min_instances > service.licence_count
                    ? t('general.instances.error')
                    : null
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
              defaultValue={!defaults ? undefined : defaults?.licence_count}
              min={0}
              endAdornment={<InputAdornment position="end">{'↑'}</InputAdornment>}
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
              defaultValue={!defaults ? undefined : defaults?.max_queue_length}
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
              defaultValue={!defaults ? undefined : defaults?.is_external}
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
              defaultValue={!defaults ? undefined : defaults?.disable_cache}
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
