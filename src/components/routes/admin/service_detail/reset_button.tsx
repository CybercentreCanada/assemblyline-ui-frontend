import { Button, Tooltip, useTheme } from '@mui/material';
import { DockerConfig, Service, UpdateConfig } from 'components/models/base/service';
import 'moment/locale/fr';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  service: DockerConfig | Service | UpdateConfig;
  defaults: DockerConfig | Service | UpdateConfig;
  field: string | string[];
  reset: () => void;
};

const WrappedResetButton = ({ service, defaults, field, reset }: Props) => {
  const { t } = useTranslation(['adminServices']);
  const theme = useTheme();

  const getValue = useCallback((obj, fieldname) => {
    const val = obj[fieldname] || null;
    return Array.isArray(val) ? JSON.stringify(val) : val;
  }, []);

  const hasChanges = useCallback(() => {
    if (Array.isArray(field)) {
      return field.some(elem => getValue(service, elem) !== getValue(defaults, elem));
    } else {
      return getValue(service, field) !== getValue(defaults, field);
    }
  }, [defaults, field, getValue, service]);

  return service && defaults && hasChanges() ? (
    <Tooltip title={t('reset.tooltip')}>
      <Button
        style={{ marginLeft: theme.spacing(1), padding: 0, lineHeight: '1rem' }}
        onClick={event => {
          event.stopPropagation();
          event.preventDefault();
          reset();
        }}
        size="small"
        color="secondary"
        variant="outlined"
      >
        {t('reset')}
      </Button>
    </Tooltip>
  ) : null;
};

const ResetButton = React.memo(WrappedResetButton);
export default ResetButton;
