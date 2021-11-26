import { Button, Tooltip, useTheme } from '@material-ui/core';
import 'moment/locale/fr';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ServiceDetail } from '../service_detail';

type ResetButtonProps = {
  service: ServiceDetail;
  defaults: ServiceDetail;
  field: string;
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
    return obj[parts[0]] || null;
  };

  return service && defaults && getValue(service, field) !== getValue(defaults, field) ? (
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
