import RefreshIcon from '@mui/icons-material/Refresh';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import type { DockerConfig, Service, UpdateConfig, UpdateSource } from 'components/models/base/service';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  service: DockerConfig | Service | UpdateConfig | UpdateSource;
  defaults: DockerConfig | Service | UpdateConfig | UpdateSource;
  field: string | string[];
  reset: (field: string | string[]) => void;
};

const WrappedResetButton = ({ service, defaults, field, reset }: Props) => {
  const { t } = useTranslation(['adminServices']);
  const theme = useTheme();

  const getValue = useCallback((obj: object, fieldname: string): unknown => {
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

  return service &&
    defaults &&
    hasChanges() &&
    (typeof field === 'string' || (Array.isArray(field) && field.every(f => typeof f === 'string'))) ? (
    <Tooltip title={t('reset.tooltip')}>
      <IconButton
        color="secondary"
        size="small"
        style={{ marginLeft: theme.spacing(1), padding: 0 }}
        onClick={event => {
          event.stopPropagation();
          event.preventDefault();
          reset(field);
        }}
      >
        <RefreshIcon />
      </IconButton>
    </Tooltip>
  ) : null;
};

const ResetButton = React.memo(WrappedResetButton);
export default ResetButton;
