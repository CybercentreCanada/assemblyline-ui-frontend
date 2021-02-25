import { Grid, Typography, useTheme } from '@material-ui/core';
import 'moment/locale/fr';
import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ServiceDetail } from '../service_detail';
import MultiTypeParam from './multi_type_param';

type ServiceParamsProps = {
  service: ServiceDetail;
  setService: (value: ServiceDetail) => void;
  setModified: (value: boolean) => void;
};

const ServiceParams = ({ service, setService, setModified }: ServiceParamsProps) => {
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

  useEffect(() => {
    function handleAdd(event: CustomEvent) {
      const { detail: param } = event;
      const newSP = [...service.submission_params, { ...param }];

      setModified(true);
      setService({ ...service, submission_params: newSP });
    }

    function handleUpdate(event: CustomEvent) {
      const {
        detail: { param, id }
      } = event;

      const newSP = [...service.submission_params];
      newSP[id] = { ...param };

      setModified(true);
      setService({ ...service, submission_params: newSP });
    }

    function handleDelete(event: CustomEvent) {
      const { detail: id } = event;
      const newSP = [...service.submission_params];
      newSP.splice(id, 1);
      setModified(true);
      setService({ ...service, submission_params: newSP });
    }

    window.addEventListener('paramAdd', handleAdd);
    window.addEventListener('paramUpdate', handleUpdate);
    window.addEventListener('paramDelete', handleDelete);

    return () => {
      window.removeEventListener('paramAdd', handleAdd);
      window.removeEventListener('paramUpdate', handleUpdate);
      window.removeEventListener('paramDelete', handleDelete);
    };
  }, [service, setModified, setService]);

  return (
    <div>
      <Grid container spacing={1} alignItems="center">
        <Grid item xs={12}>
          <Typography variant="h6">{t('params.user')}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2">{t('params.user.current')}</Typography>
        </Grid>
        {service.submission_params.length !== 0 ? (
          service.submission_params.map((param, i) => {
            return (
              <Grid item key={i} xs={12}>
                <MultiTypeParam param={param} id={i} onUpdate={onParamUpdate} onDelete={onParamDelete} />
              </Grid>
            );
          })
        ) : (
          <Grid item xs={12}>
            <Typography variant="caption" color="textSecondary">
              {t('params.user.none')}
            </Typography>
          </Grid>
        )}
        <Grid item xs={12} style={{ marginTop: theme.spacing(2) }}>
          <Typography variant="subtitle2">{t('params.user.new')}</Typography>
        </Grid>
        <Grid item xs={12}>
          <MultiTypeParam onAdd={onParamAdd} />
        </Grid>
      </Grid>
    </div>
  );
};

export default ServiceParams;
