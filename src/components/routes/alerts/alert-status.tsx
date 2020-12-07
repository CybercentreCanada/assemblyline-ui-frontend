import CustomChip from 'components/visual/CustomChip';
import React from 'react';
import { useTranslation } from 'react-i18next';

const COLOR_MAP = {
  TRIAGE: 'default',
  MALICIOUS: 'error',
  'NON-MALICIOUS': 'success',
  ASSESS: 'primary'
};

const AlertStatus = ({ name }) => {
  const { t } = useTranslation('alerts');
  return <CustomChip size="small" variant="outlined" color={COLOR_MAP[name]} label={t(`status_${name}`)} />;
};

export default AlertStatus;
