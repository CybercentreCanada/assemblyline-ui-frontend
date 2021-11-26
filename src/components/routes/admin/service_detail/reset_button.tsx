import { Button, Tooltip, useTheme } from '@material-ui/core';
import 'moment/locale/fr';
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
    const parts = fieldname.split('.', 1);
    if (parts.lenght >= 1) {
      const newobj = obj[parts[0]] || {};
      return getValue(newobj, parts[1]);
    }
    const val = obj[parts[0]] || null;
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
        onClick={reset}
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
