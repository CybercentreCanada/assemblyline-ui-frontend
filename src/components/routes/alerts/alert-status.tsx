import CustomChip from 'components/visual/CustomChip';
import React from 'react';
import { useTranslation } from 'react-i18next';

const COLOR_MAP = {
  TRIAGE: 'default',
  MALICIOUS: 'error',
  'NON-MALICIOUS': 'success',
  ASSESS: 'primary'
};

type AlertStatusProps = {
  name: string;
  size?: 'tiny' | 'small' | 'medium';
};

const AlertStatus: React.FC<AlertStatusProps> = ({ name, size = 'small' as 'small' }) => {
  const { t } = useTranslation('alerts');
  return name ? (
    <CustomChip size={size} variant="outlined" color={COLOR_MAP[name]} label={t(`status_${name}`)} />
  ) : null;
};

export default AlertStatus;
