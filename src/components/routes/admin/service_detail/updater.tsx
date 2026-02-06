import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import { Button, Grid, IconButton, Tooltip, Typography, useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import type { Service, UpdateSource } from 'components/models/base/service';
import { DEFAULT_SOURCE } from 'components/models/base/service';
import { showReset } from 'components/routes/admin/service_detail/service.utils';
import SourceDialog from 'components/routes/admin/service_detail/source_dialog';
import { SourceCard } from 'components/routes/manage/signature_sources';
import { NumberInput } from 'components/visual/Inputs/NumberInput';
import { RadioInput } from 'components/visual/Inputs/RadioInput';
import { SelectInput } from 'components/visual/Inputs/SelectInput';
import { SliderInput } from 'components/visual/Inputs/SliderInput';
import { TextInput } from 'components/visual/Inputs/TextInput';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type ServiceUpdaterProps = {
  service: Service;
  defaults: Service;
  setService: (value: Service) => void;
  setModified: (value: boolean) => void;
};

const ServiceUpdater = ({ service, defaults, setService, setModified }: ServiceUpdaterProps) => {
  const { t } = useTranslation(['adminServices']);
  const theme = useTheme();
  const { c12nDef } = useALContext();

  const [dialog, setDialog] = useState<boolean>(false);
  const [editDialog, setEditDialog] = useState<boolean>(false);
  const [editedSourceID, setEditedSourceID] = useState<number>(-1);

  const handleDeleteSource = useCallback(
    (source_id: number) => {
      const newSources = service.update_config.sources;
      newSources.splice(source_id, 1);
      setModified(true);
      setService({
        ...service,
        update_config: { ...service.update_config, sources: newSources }
      });
    },
    [service, setModified, setService]
  );

  const handleEditSource = useCallback((source_id: number) => {
    setEditDialog(true);
    setEditedSourceID(source_id);
  }, []);

  const handleSaveSource = useCallback(
    (newSource: UpdateSource) => {
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
    },
    [editedSourceID, service, setModified, setService]
  );

  const findDefaults = useCallback(
    (curSource: UpdateSource) => {
      if (defaults && defaults.update_config && defaults.update_config.sources) {
        return defaults.update_config.sources.find(element => {
          if (curSource.name === element.name) {
            return element;
          }
          return null;
        });
      }

      return null;
    },
    [defaults]
  );

  useEffect(() => {
    if (!editDialog && editedSourceID !== -1) {
      setEditedSourceID(-1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editDialog]);

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <Typography variant="h6">{t('updater')}</Typography>
      </Grid>

      <Grid size={{ xs: 12, sm: 9 }}>
        <SliderInput
          label={t('updater.interval')}
          value={!service ? null : service.update_config.update_interval_seconds}
          defaultValue={!defaults ? undefined : (defaults?.update_config?.update_interval_seconds ?? 3600)}
          loading={!service}
          reset={showReset(service.update_config, defaults.update_config, 'update_interval_seconds')}
          min={3600}
          max={86400}
          step={1}
          valueLabelDisplay="off"
          marks={[
            { value: 3600, label: '1h' },
            { value: 14400, label: '4h' },
            { value: 21600, label: '6h' },
            { value: 43200, label: '12h' },
            { value: 86400, label: '24h' }
          ]}
          valueLabelFormat={x => x / 3600}
          onChange={(e, v) => {
            if (service?.update_config?.update_interval_seconds !== v) setModified(true);
            setService({
              ...service,
              update_config: {
                ...service.update_config,
                update_interval_seconds: v
              }
            });
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 3 }}>
        <NumberInput
          id="update_interval_seconds"
          value={!service ? null : service.update_config.update_interval_seconds}
          loading={!service}
          endAdornment="sec"
          min={60}
          max={86400}
          coercers={c => c.required()}
          validators={v => v.required()}
          onChange={(e, v) => {
            if (service?.update_config?.update_interval_seconds !== v) setModified(true);
            setService({
              ...service,
              update_config: { ...service.update_config, update_interval_seconds: v }
            });
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <RadioInput
          label={t('updater.signatures')}
          loading={!service}
          value={!service ? null : service.update_config.generates_signatures}
          defaultValue={!defaults ? undefined : defaults?.update_config?.generates_signatures}
          reset={showReset(service.update_config, defaults.update_config, 'generates_signatures')}
          options={
            [
              { value: true, label: t('updater.signatures.yes') },
              { value: false, label: t('updater.signatures.no') }
            ] as const
          }
          onChange={(e, v) => {
            if (service?.update_config?.generates_signatures !== v) setModified(true);
            setService({
              ...service,
              update_config: {
                ...service.update_config,
                generates_signatures: v
              }
            });
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <RadioInput
          label={t('updater.wait')}
          loading={!service}
          value={!service ? null : service.update_config.wait_for_update}
          defaultValue={!defaults ? undefined : defaults?.update_config?.wait_for_update}
          reset={showReset(service.update_config, defaults.update_config, 'wait_for_update')}
          options={
            [
              { value: true, label: t('updater.wait.yes') },
              { value: false, label: t('updater.wait.no') }
            ] as const
          }
          onChange={(e, v) => {
            if (service?.update_config?.wait_for_update !== v) setModified(true);
            setService({
              ...service,
              update_config: {
                ...service.update_config,
                wait_for_update: v
              }
            });
          }}
        />
      </Grid>

      {service?.update_config?.generates_signatures && (
        <>
          <Grid size={{ xs: 12, ...(service.update_config.signature_delimiter === 'custom' && { sm: 7, md: 8 }) }}>
            <SelectInput
              label={t('updater.signature_delimiter')}
              loading={!service}
              value={!service ? null : service.update_config.signature_delimiter}
              defaultValue={!defaults ? undefined : defaults?.update_config?.signature_delimiter}
              reset={showReset(service.update_config, defaults.update_config, [
                'signature_delimiter',
                'custom_delimiter'
              ])}
              options={
                [
                  { value: 'new_line', primary: t('updater.signature_delimiter.new_line') },
                  { value: 'double_new_line', primary: t('updater.signature_delimiter.double_new_line') },
                  { value: 'pipe', primary: t('updater.signature_delimiter.pipe') },
                  { value: 'comma', primary: t('updater.signature_delimiter.comma') },
                  { value: 'space', primary: t('updater.signature_delimiter.space') },
                  { value: 'none', primary: t('updater.signature_delimiter.none') },
                  { value: 'file', primary: t('updater.signature_delimiter.file') },
                  { value: 'custom', primary: t('updater.signature_delimiter.custom') }
                ] as const
              }
              onChange={(e, v) => {
                if (service?.update_config?.signature_delimiter !== v) setModified(true);
                setService({ ...service, update_config: { ...service.update_config, signature_delimiter: v } });
              }}
              onReset={() => {
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
          </Grid>
          {service.update_config.signature_delimiter === 'custom' && (
            <Grid size={{ xs: 12, sm: 5, md: 4 }}>
              <TextInput
                id="custom_delimiter"
                loading={!service}
                value={
                  !service ? null : service.update_config.custom_delimiter ? service.update_config.custom_delimiter : ''
                }
                onChange={(e, v) => {
                  if (service?.update_config?.custom_delimiter !== v) setModified(true);
                  setService({ ...service, update_config: { ...service.update_config, custom_delimiter: v } });
                }}
              />
            </Grid>
          )}
        </>
      )}

      <Grid size={{ xs: 12 }}>
        <Typography color="textSecondary" variant="subtitle2">
          {t('updater.sources')}
        </Typography>
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
                  generatesSignatures={service.update_config.generates_signatures}
                />
              </div>
              <div>
                <Tooltip title={t('updater.sources.remove')}>
                  <IconButton
                    style={{
                      color: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark
                    }}
                    onClick={() => handleDeleteSource(i)}
                    size="large"
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

      <Grid size={{ xs: 12 }}>
        <SourceDialog
          open={dialog}
          source={{
            ...DEFAULT_SOURCE,
            update_interval: service.update_config.update_interval_seconds,
            default_classification: c12nDef.UNRESTRICTED,
            pattern: service.update_config.default_pattern
          }}
          setOpen={setDialog}
          onSave={handleSaveSource}
        />
        <Button variant="contained" color="primary" onClick={() => setDialog(true)}>
          {t('updater.sources.add')}
        </Button>
      </Grid>
    </Grid>
  );
};

export default ServiceUpdater;
