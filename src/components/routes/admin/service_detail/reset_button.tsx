import { Button, Tooltip, useTheme } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

type ResetButtonProps = {
  service: any;
  defaults: any;
  field: string | string[];
  reset: () => void;
};

const WrappedResetButton = ({ service, defaults, field, reset }: ResetButtonProps) => {
  const { t } = useTranslation(['adminServices']);
  const theme = useTheme();

  const getValue = (obj, fieldname) => {
    const val = obj[fieldname] || null;
    return Array.isArray(val) ? JSON.stringify(val) : val;
  };

  const hasChanges = () => {
    if (Array.isArray(field)) {
      return field.some(elem => getValue(service, elem) !== getValue(defaults, elem));
    } else {
      return getValue(service, field) !== getValue(defaults, field);
    }
  };

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
