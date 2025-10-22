import { Grid, Typography, useTheme } from '@mui/material';
import type { Service } from 'components/models/base/service';
import MultiTypeConfig from 'components/routes/admin/service_detail/multi_type_config';
import MultiTypeParam from 'components/routes/admin/service_detail/multi_type_param';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type ServiceParamsProps = {
  service: Service;
  defaults: Service;
  setService: (value: Service) => void;
  setModified: (value: boolean) => void;
};

const ServiceParams = ({ service, defaults, setService, setModified }: ServiceParamsProps) => {
  const { t } = useTranslation(['adminServices']);
  const theme = useTheme();

  const onParamAdd = useCallback(param => {
    window.dispatchEvent(new CustomEvent('paramAdd', { detail: param }));
  }, []);

  const onParamUpdate = useCallback((param, id) => {
    window.dispatchEvent(new CustomEvent('paramUpdate', { detail: { param, id } }));
  }, []);

  const onParamDelete = useCallback(id => {
    window.dispatchEvent(new CustomEvent('paramDelete', { detail: id }));
  }, []);

  const onConfigAddUpdate = useCallback(config => {
    window.dispatchEvent(new CustomEvent('configAddUpdate', { detail: config }));
  }, []);

  const onConfigDelete = useCallback(config => {
    window.dispatchEvent(new CustomEvent('configDelete', { detail: config }));
  }, []);

  const unusedParams = useMemo<string[]>(() => {
    const defaultParams = new Set(defaults.submission_params?.map(p => p.name) ?? []);
    return (service.submission_params ?? []).filter(({ name }) => !defaultParams.has(name)).map(({ name }) => name);
  }, [service.submission_params, defaults.submission_params]);

  useEffect(() => {
    function handleSPAdd(event: CustomEvent) {
      const { detail: param } = event;
      const newSP = [...service.submission_params, { ...param }];

      setModified(true);
      setService({ ...service, submission_params: newSP });
    }

    function handleSPUpdate(event: CustomEvent) {
      const {
        detail: { param, id }
      } = event;

      const newSP = [...service.submission_params];
      newSP[id] = { ...param };

      setModified(true);
      setService({ ...service, submission_params: newSP });
    }

    function handleSPDelete(event: CustomEvent) {
      const { detail: id } = event;
      const newSP = [...service.submission_params];
      newSP.splice(id, 1);
      setModified(true);
      setService({ ...service, submission_params: newSP });
    }

    function handleConfigAddUpdate(event: CustomEvent) {
      const { detail: config } = event;
      setModified(true);
      setService({ ...service, config: { ...service.config, [config.name]: config.value } });
    }

    function handleConfigDelete(event: CustomEvent) {
      const { detail: config } = event;
      const newConfig = { ...service.config };
      delete newConfig[config.name];
      setModified(true);
      setService({ ...service, config: newConfig });
    }

    window.addEventListener('paramAdd', handleSPAdd);
    window.addEventListener('paramUpdate', handleSPUpdate);
    window.addEventListener('paramDelete', handleSPDelete);
    window.addEventListener('configAddUpdate', handleConfigAddUpdate);
    window.addEventListener('configDelete', handleConfigDelete);

    return () => {
      window.removeEventListener('paramAdd', handleSPAdd);
      window.removeEventListener('paramUpdate', handleSPUpdate);
      window.removeEventListener('paramDelete', handleSPDelete);
      window.removeEventListener('configAddUpdate', handleConfigAddUpdate);
      window.removeEventListener('configDelete', handleConfigDelete);
    };
  }, [service, setModified, setService]);

  return (
    <div>
      <Grid container spacing={1} alignItems="center">
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6">{t('params.user')}</Typography>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2">{t('params.user.current')}</Typography>
        </Grid>
        {service.submission_params.length !== 0 ? (
          service.submission_params.map((param, i) => (
            <Grid key={i} size={{ xs: 12 }}>
              <MultiTypeParam
                param={param}
                id={i}
                warn={unusedParams.includes(param.name)}
                onUpdate={onParamUpdate}
                onDelete={onParamDelete}
              />
            </Grid>
          ))
        ) : (
          <Grid size={{ xs: 12 }}>
            <Typography variant="caption" color="textSecondary">
              {t('params.user.none')}
            </Typography>
          </Grid>
        )}
        <Grid size={{ xs: 12 }} style={{ marginTop: theme.spacing(2) }}>
          <Typography variant="subtitle2">{t('params.user.new')}</Typography>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <MultiTypeParam onAdd={onParamAdd} />
        </Grid>

        <Grid size={{ xs: 12 }} style={{ marginTop: theme.spacing(2) }}>
          <Typography variant="h6">{t('params.config')}</Typography>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2">{t('params.config.current')}</Typography>
        </Grid>
        {Object.keys(service.config).length !== 0 ? (
          Object.keys(service.config).map((name, i) => (
            <Grid key={i} size={{ xs: 12 }}>
              <MultiTypeConfig
                config={{ name, value: service.config[name], warn: defaults.config[name] === undefined }}
                onUpdate={onConfigAddUpdate}
                onDelete={onConfigDelete}
              />
            </Grid>
          ))
        ) : (
          <Grid size={{ xs: 12 }}>
            <Typography variant="caption" color="textSecondary">
              {t('params.config.none')}
            </Typography>
          </Grid>
        )}
        <Grid size={{ xs: 12 }} style={{ marginTop: theme.spacing(2) }}>
          <Typography variant="subtitle2">{t('params.config.new')}</Typography>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <MultiTypeConfig onAdd={onConfigAddUpdate} />
        </Grid>
      </Grid>
    </div>
  );
};

export default ServiceParams;
